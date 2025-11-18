// lib/x3dh-client.ts
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface ClientPreKeyBundle {
  identityKey: string;
  signedPreKey: {
    keyId: number;
    publicKey: string;
    signature: string;
  };
  oneTimePreKey?: {
    keyId: number;
    publicKey: string;
  };
}

export class X3DHClient {
  // Generate X25519 key pair for encryption (client-side)
  static generateKeyPair(): KeyPair {
    const keyPair = nacl.box.keyPair();
    
    return {
      publicKey: encodeBase64(keyPair.publicKey),
      privateKey: encodeBase64(keyPair.secretKey),
    };
  }

  // Generate Ed25519 signing key pair (for identity keys)
  static generateSigningKeyPair(): KeyPair {
    // Generate a random seed (32 bytes)
    const seed = nacl.randomBytes(32);
    
    // Generate key pair from seed (this ensures secretKey is 64 bytes)
    const keyPair = nacl.sign.keyPair.fromSeed(seed);
    
    console.log('RAW KEY PAIR GENERATED:', {
      secretKeyLength: keyPair.secretKey.length,
      publicKeyLength: keyPair.publicKey.length,
      secretKeyType: keyPair.secretKey.constructor.name
    });
    
    const encoded = encodeBase64(keyPair.secretKey);
    console.log('ENCODED PRIVATE KEY:', {
      base64Length: encoded.length,
      expectedLength: Math.ceil(64 * 4 / 3) // base64 of 64 bytes
    });
    
    const decoded = decodeBase64(encoded);
    console.log('DECODED BACK:', {
      decodedLength: decoded.length
    });
    
    return {
      publicKey: encodeBase64(keyPair.publicKey),
      privateKey: encoded,
    };
  }

  // Sign data using Ed25519
  static sign(privateKeyBase64: string, data: string): string {
    const privateKey = decodeBase64(privateKeyBase64);
    
    // Ed25519 secret key must be 64 bytes
    if (privateKey.length !== 64) {
      throw new Error(`Invalid Ed25519 secret key size: ${privateKey.length} bytes (expected 64)`);
    }
    
    // Data can be either base64 or plain string - handle both
    let dataBytes: Uint8Array;
    try {
      // Try to decode as base64 first
      dataBytes = decodeBase64(data);
    } catch {
      // If that fails, encode as UTF-8 string
      dataBytes = new TextEncoder().encode(data);
    }
    const signature = nacl.sign.detached(dataBytes, privateKey);
    
    return encodeBase64(signature);
  }

  // Verify Ed25519 signature
  static verify(publicKeyBase64: string, data: string, signatureBase64: string): boolean {
    try {
      const publicKey = decodeBase64(publicKeyBase64);
      // Data can be either base64 or plain string - handle both
      let dataBytes: Uint8Array;
      try {
        dataBytes = decodeBase64(data);
      } catch {
        dataBytes = new TextEncoder().encode(data);
      }
      const signature = decodeBase64(signatureBase64);
      
      return nacl.sign.detached.verify(dataBytes, signature, publicKey);
    } catch {
      return false;
    }
  }

  // Perform X3DH as initiator
  static initiateX3DH(
    myIdentityKey: KeyPair,
    ephemeralKey: KeyPair,
    bundle: ClientPreKeyBundle
  ): { sharedSecret: string; ephemeralPublicKey: string } {
    const dh1 = this.diffieHellman(
      myIdentityKey.privateKey,
      bundle.signedPreKey.publicKey
    );
    const dh2 = this.diffieHellman(
      ephemeralKey.privateKey,
      bundle.identityKey
    );
    const dh3 = this.diffieHellman(
      ephemeralKey.privateKey,
      bundle.signedPreKey.publicKey
    );

    let combinedSecret: Uint8Array;
    
    if (bundle.oneTimePreKey) {
      const dh4 = this.diffieHellman(
        ephemeralKey.privateKey,
        bundle.oneTimePreKey.publicKey
      );
      
      // Concatenate all DH outputs
      const dh1Bytes = decodeBase64(dh1);
      const dh2Bytes = decodeBase64(dh2);
      const dh3Bytes = decodeBase64(dh3);
      const dh4Bytes = decodeBase64(dh4);
      
      combinedSecret = new Uint8Array(
        dh1Bytes.length + dh2Bytes.length + dh3Bytes.length + dh4Bytes.length
      );
      combinedSecret.set(dh1Bytes, 0);
      combinedSecret.set(dh2Bytes, dh1Bytes.length);
      combinedSecret.set(dh3Bytes, dh1Bytes.length + dh2Bytes.length);
      combinedSecret.set(dh4Bytes, dh1Bytes.length + dh2Bytes.length + dh3Bytes.length);
    } else {
      const dh1Bytes = decodeBase64(dh1);
      const dh2Bytes = decodeBase64(dh2);
      const dh3Bytes = decodeBase64(dh3);
      
      combinedSecret = new Uint8Array(
        dh1Bytes.length + dh2Bytes.length + dh3Bytes.length
      );
      combinedSecret.set(dh1Bytes, 0);
      combinedSecret.set(dh2Bytes, dh1Bytes.length);
      combinedSecret.set(dh3Bytes, dh1Bytes.length + dh2Bytes.length);
    }

    // Derive key using HKDF (simplified version using SHA-256)
    const derivedKey = this.hkdf(combinedSecret, 32);
    
    return {
      sharedSecret: encodeBase64(derivedKey),
      ephemeralPublicKey: ephemeralKey.publicKey,
    };
  }

  // Diffie-Hellman operation using X25519
  private static diffieHellman(privateKeyBase64: string, publicKeyBase64: string): string {
    const privateKey = decodeBase64(privateKeyBase64);
    const publicKey = decodeBase64(publicKeyBase64);
    
    const sharedSecret = nacl.scalarMult(privateKey, publicKey);
    
    return encodeBase64(sharedSecret);
  }

  // Simplified HKDF using Web Crypto API
  private static async hkdfAsync(
    ikm: Uint8Array,
    length: number,
    salt?: Uint8Array,
    info?: Uint8Array
  ): Promise<Uint8Array> {
    // Import the input keying material
    const key = await crypto.subtle.importKey(
      'raw',
      ikm,
      { name: 'HKDF' },
      false,
      ['deriveBits']
    );

    // Derive bits using HKDF
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: salt || new Uint8Array(0),
        info: info || new Uint8Array(0),
      },
      key,
      length * 8 // length in bits
    );

    return new Uint8Array(derivedBits);
  }

  // Synchronous HKDF fallback using SHA-256 (simplified, not full HKDF spec)
  private static hkdf(ikm: Uint8Array, length: number): Uint8Array {
    // For browser compatibility, we use a simplified version
    // In production, use a proper HKDF implementation or async version above
    const hash = nacl.hash(ikm);
    return hash.slice(0, length);
  }

  // Generate one-time prekeys
  static generateOneTimePreKeys(count: number, startId: number) {
    const keys = [];
    for (let i = 0; i < count; i++) {
      const keyPair = this.generateKeyPair();
      keys.push({
        keyId: startId + i,
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
      });
    }
    return keys;
  }

  // Async version of initiateX3DH with proper HKDF
  static async initiateX3DHAsync(
    myIdentityKey: KeyPair,
    ephemeralKey: KeyPair,
    bundle: ClientPreKeyBundle
  ): Promise<{ sharedSecret: string; ephemeralPublicKey: string }> {
    const dh1 = this.diffieHellman(
      myIdentityKey.privateKey,
      bundle.signedPreKey.publicKey
    );
    const dh2 = this.diffieHellman(
      ephemeralKey.privateKey,
      bundle.identityKey
    );
    const dh3 = this.diffieHellman(
      ephemeralKey.privateKey,
      bundle.signedPreKey.publicKey
    );

    let combinedSecret: Uint8Array;
    
    if (bundle.oneTimePreKey) {
      const dh4 = this.diffieHellman(
        ephemeralKey.privateKey,
        bundle.oneTimePreKey.publicKey
      );
      
      const dh1Bytes = decodeBase64(dh1);
      const dh2Bytes = decodeBase64(dh2);
      const dh3Bytes = decodeBase64(dh3);
      const dh4Bytes = decodeBase64(dh4);
      
      combinedSecret = new Uint8Array(
        dh1Bytes.length + dh2Bytes.length + dh3Bytes.length + dh4Bytes.length
      );
      combinedSecret.set(dh1Bytes, 0);
      combinedSecret.set(dh2Bytes, dh1Bytes.length);
      combinedSecret.set(dh3Bytes, dh1Bytes.length + dh2Bytes.length);
      combinedSecret.set(dh4Bytes, dh1Bytes.length + dh2Bytes.length + dh3Bytes.length);
    } else {
      const dh1Bytes = decodeBase64(dh1);
      const dh2Bytes = decodeBase64(dh2);
      const dh3Bytes = decodeBase64(dh3);
      
      combinedSecret = new Uint8Array(
        dh1Bytes.length + dh2Bytes.length + dh3Bytes.length
      );
      combinedSecret.set(dh1Bytes, 0);
      combinedSecret.set(dh2Bytes, dh1Bytes.length);
      combinedSecret.set(dh3Bytes, dh1Bytes.length + dh2Bytes.length);
    }

    // Use proper HKDF with Web Crypto API
    const derivedKey = await this.hkdfAsync(combinedSecret, 32);
    
    return {
      sharedSecret: encodeBase64(derivedKey),
      ephemeralPublicKey: ephemeralKey.publicKey,
    };
  }
}