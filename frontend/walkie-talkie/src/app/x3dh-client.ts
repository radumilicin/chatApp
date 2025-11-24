// lib/x3dh-client.ts
// Browser-compatible X3DH implementation using TweetNaCl
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
  // Generate X25519 key pair using TweetNaCl
  static generateKeyPair(): KeyPair {
    const keyPair = nacl.box.keyPair();
    
    return {
      publicKey: encodeBase64(keyPair.publicKey),
      privateKey: encodeBase64(keyPair.secretKey),
    };
  }

  static getOrCreateLocalKey = (): string => {
    const STORAGE_KEY = "self_encryption_key";
    
    let key = localStorage.getItem(STORAGE_KEY);
    
    if (!key) {
      // Generate new key
      key = encodeBase64(nacl.randomBytes(32));
      localStorage.setItem(STORAGE_KEY, key);
      console.log('Generated new local encryption key');
    }
    
    return key;
  };

  /**
   * Encrypt a message for yourself using your local key
   * This is used to store your sent messages encrypted on the server
   * 
   * @param plaintext - The message to encrypt
   * @param localKey - Your local encryption key (from getOrCreateLocalKey)
   * @returns Base64-encoded encrypted message (nonce + ciphertext)
  */
  static encryptForSelf = (plaintext: string, localKey: string): string => {
    try {
      // Decode the key from base64
      const key = decodeBase64(localKey);
      
      // Validate key length
      if (key.length !== 32) {
        throw new Error(`Invalid key length: ${key.length}, expected 32 bytes`);
      }
      
      // Convert plaintext to bytes
      const plaintextBytes = new TextEncoder().encode(plaintext);
      
      // Generate random nonce (24 bytes for nacl.secretbox)
      const nonce = nacl.randomBytes(24);
      
      // Encrypt using XSalsa20-Poly1305
      const ciphertext = nacl.secretbox(plaintextBytes, nonce, key);
      
      if (!ciphertext) {
        throw new Error('Encryption failed');
      }
      
      // Combine nonce + ciphertext
      const combined = new Uint8Array(nonce.length + ciphertext.length);
      combined.set(nonce, 0);
      combined.set(ciphertext, nonce.length);
      
      // Return as base64
      return encodeBase64(combined);
    } catch (error) {
      console.error('Self-encryption failed:', error);
      throw new Error(`Failed to encrypt message for self: ${error.message}`);
    }
  };

  /**
   * Decrypt a message you encrypted for yourself
   * 
   * @param ciphertext - Base64-encoded encrypted message (from encryptForSelf)
   * @param localKey - Your local encryption key (from getOrCreateLocalKey)
   * @returns Decrypted plaintext message
  */
  static decryptForSelf = (ciphertext: string, localKey: string): string => {
  try {
    // Decode the key from base64
    const key = decodeBase64(localKey);
    
    // Validate key length
    if (key.length !== 32) {
      throw new Error(`Invalid key length: ${key.length}, expected 32 bytes`);
    }
    
    // Decode the combined data
    const combined = decodeBase64(ciphertext);
    
    // Validate minimum length (24 bytes nonce + at least some ciphertext)
    if (combined.length < 24) {
      throw new Error(`Invalid ciphertext length: ${combined.length}, expected at least 24 bytes`);
    }
    
    // Extract nonce (first 24 bytes) and ciphertext (rest)
    const nonce = combined.subarray(0, 24);
    const encryptedBytes = combined.subarray(24);
    
    // Decrypt using XSalsa20-Poly1305
    const decrypted = nacl.secretbox.open(encryptedBytes, nonce, key);
    
    if (!decrypted) {
      throw new Error('Decryption failed - invalid key or corrupted data');
    }
    
    // Convert bytes back to string
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Self-decryption failed:', error);
    throw new Error(`Failed to decrypt message for self: ${error.message}`);
  }
};

  /**
   * Clear the local encryption key (use when logging out)
   * WARNING: This will make all your sent messages unreadable!
  */
  static clearLocalKey = (): void => {
    localStorage.removeItem('local_encryption_key');
    console.log('Local encryption key cleared');
  };

  /**
   * Check if a local encryption key exists
  */
  static hasLocalKey = (): boolean => {
    return localStorage.getItem('local_encryption_key') !== null;
  };

  /**
   * Export the local key (for backup purposes)
   * WARNING: Keep this key safe! Anyone with this key can decrypt your sent messages
  */
  static exportLocalKey = (): string | null => {
    return localStorage.getItem('local_encryption_key');
  };

  /**
   * Import a local key (for restoring from backup)
   * 
   * @param key - Base64-encoded encryption key
 */
  static importLocalKey = (key: string): void => {
    try {
      // Validate it's valid base64
      const keyBytes = decodeBase64(key);
      
      if (keyBytes.length !== 32) {
        throw new Error('Invalid key length');
      }
      
      localStorage.setItem('local_encryption_key', key);
      console.log('Local encryption key imported successfully');
    } catch (error) {
      console.error('Failed to import key:', error);
      throw new Error('Invalid encryption key format');
    }
  };

  // Perform X3DH as initiator (Alice)
  static async initiateX3DH(
    myIdentityKey: KeyPair,
    ephemeralKey: KeyPair,
    bundle: ClientPreKeyBundle
  ): Promise<{ sharedSecret: string; ephemeralPublicKey: string }> {
    console.log("Starting X3DH as initiator");
    
    // Perform 4 DH operations
    const dh1 = this.diffieHellman(
      myIdentityKey.privateKey,
      bundle.signedPreKey.publicKey
    );
    console.log("DH1 complete");
    
    const dh2 = this.diffieHellman(
      ephemeralKey.privateKey,
      bundle.identityKey
    );
    console.log("DH2 complete");
    
    const dh3 = this.diffieHellman(
      ephemeralKey.privateKey,
      bundle.signedPreKey.publicKey
    );
    console.log("DH3 complete");

    let combinedSecret: Uint8Array;

    if (bundle.oneTimePreKey) {
      const dh4 = this.diffieHellman(
        ephemeralKey.privateKey,
        bundle.oneTimePreKey.publicKey
      );
      console.log("DH4 complete (with one-time prekey)");

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
      console.log("No one-time prekey, using 3 DH operations");
      
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

    // Derive key using HKDF
    const derivedKey = await this.hkdf(combinedSecret, 32);
    console.log("Shared secret derived successfully");

    return {
      sharedSecret: encodeBase64(derivedKey),
      ephemeralPublicKey: ephemeralKey.publicKey,
    };
  }

  // Diffie-Hellman using TweetNaCl
  private static diffieHellman(
    privateKeyBase64: string,
    publicKeyBase64: string
  ): string {
    this.debugKeyFormat(privateKeyBase64, 'privateKey');
    this.debugKeyFormat(publicKeyBase64, 'publicKey');

    const privateKey = decodeBase64(privateKeyBase64);
    const publicKey = decodeBase64(publicKeyBase64);
    
    // Perform X25519 scalar multiplication
    const sharedSecret = nacl.scalarMult(privateKey, publicKey);
    
    return encodeBase64(sharedSecret);
  }

  // Debug helper to check what format your data is in
  static debugKeyFormat(key: any, keyName: string): void {
    console.log(`\n=== Debugging ${keyName} ===`);
    console.log('Type:', typeof key);
    console.log('Is Uint8Array?', key instanceof Uint8Array);
    console.log('Is ArrayBuffer?', key instanceof ArrayBuffer);
    console.log('Is string?', typeof key === 'string');
    
    if (typeof key === 'string') {
      console.log('String length:', key.length);
      console.log('First 50 chars:', key.substring(0, 50));
      
      // Check if it looks like base64
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      console.log('Looks like base64?', base64Regex.test(key));
      
      // Check if it looks like hex
      const hexRegex = /^[0-9a-fA-F]+$/;
      console.log('Looks like hex?', hexRegex.test(key));
    } else if (key instanceof Uint8Array) {
      console.log('Uint8Array length:', key.length);
      console.log('First 10 bytes:', Array.from(key.slice(0, 10)));
    }
    console.log('===================\n');
  }

  // HKDF using Web Crypto API
  private static async hkdf(ikm: Uint8Array, length: number): Promise<Uint8Array> {
    // Import key material
    const key = await crypto.subtle.importKey(
      'raw',
      ikm,
      { name: 'HKDF' },
      false,
      ['deriveKey', 'deriveBits']
    );

    // Derive key
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: new Uint8Array(0),
        info: new Uint8Array(0),
      },
      key,
      length * 8
    );

    return new Uint8Array(derivedBits);
  }

  // Sign data using Ed25519
  static sign(privateKeyBase64: string, dataBase64: string): string {
    // For Ed25519 signing, we need to convert X25519 key to Ed25519
    // In production, you should store separate Ed25519 signing keys
    // For now, we'll use HMAC as a placeholder
    const privateKey = decodeBase64(privateKeyBase64);
    const data = decodeBase64(dataBase64);
    
    // Simple HMAC signature (replace with Ed25519 in production)
    const hash = nacl.hash(new Uint8Array([...privateKey, ...data]));
    return encodeBase64(hash.slice(0, 64));
  }

  // Verify signature
  static verify(publicKeyBase64: string, dataBase64: string, signatureBase64: string): boolean {
    try {
      // Simplified verification (use Ed25519 in production)
      const publicKey = decodeBase64(publicKeyBase64);
      const data = decodeBase64(dataBase64);
      const signature = decodeBase64(signatureBase64);
      
      // For now, just verify signature is correct length
      return signature.length === 64;
    } catch {
      return false;
    }
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

  // Perform X3DH as RECEIVER (Bob's side)
  static async performX3DHAsReceiver(
    myIdentityKey: KeyPair,
    mySignedPreKey: { publicKey: string; privateKey: string; signature: string },
    theirEphemeralKey: string,
    theirIdentityKey: string,
    oneTimePreKeyId?: number
  ): Promise<string> {
    console.log("Starting X3DH as receiver");
    
    // DH1 = DH(SPKb, IKa)
    const dh1 = this.diffieHellman(
      mySignedPreKey.privateKey,
      theirIdentityKey
    );
    console.log("DH1 complete");

    // DH2 = DH(IKb, EKa)
    const dh2 = this.diffieHellman(
      myIdentityKey.privateKey,
      theirEphemeralKey
    );
    console.log("DH2 complete");

    // DH3 = DH(SPKb, EKa)
    const dh3 = this.diffieHellman(
      mySignedPreKey.privateKey,
      theirEphemeralKey
    );
    console.log("DH3 complete");

    let combinedSecret: Uint8Array;

    if (oneTimePreKeyId !== undefined) {
      const myOneTimePreKey = this.loadOneTimePreKey(oneTimePreKeyId);

      if (myOneTimePreKey) {
        // DH4 = DH(OPKb, EKa)
        const dh4 = this.diffieHellman(
          myOneTimePreKey.privateKey,
          theirEphemeralKey
        );
        console.log("DH4 complete (with one-time prekey)");

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

        this.deleteOneTimePreKey(oneTimePreKeyId);
      } else {
        console.warn('One-time prekey not found, proceeding without DH4');
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

    // Derive key using HKDF
    const derivedKey = await this.hkdf(combinedSecret, 32);
    const sharedSecret = encodeBase64(derivedKey);
    console.log("Shared secret derived successfully (receiver)");

    // Bob's side (after performX3DHAsReceiver)
    console.log("=== BOB X3DH OUTPUT ===");
    console.log("Shared secret:", sharedSecret.substring(0, 30) + "...");
    console.log("Using Alice's ephemeral key:", theirEphemeralKey.substring(0, 30) + "...");
    console.log("Using Alice's identity key:", theirIdentityKey.substring(0, 30) + "...");
    console.log("Using my signed prekey:", mySignedPreKey.publicKey.substring(0, 30) + "...");
    console.log("One-time prekey ID:", oneTimePreKeyId);

    return encodeBase64(derivedKey);
  }

  // Helper: Load one-time prekey from localStorage
  private static loadOneTimePreKey(keyId: number): { publicKey: string; privateKey: string } | null {
    const storedKeys = localStorage.getItem('one_time_prekeys');
    if (!storedKeys) return null;

    const keys = JSON.parse(storedKeys);
    return keys.find((k: any) => k.keyId === keyId) || null;
  }

  // Helper: Delete one-time prekey after use
  private static deleteOneTimePreKey(keyId: number): void {
    const storedKeys = localStorage.getItem('one_time_prekeys');
    if (!storedKeys) return;

    const keys = JSON.parse(storedKeys);
    const updatedKeys = keys.filter((k: any) => k.keyId !== keyId);
    localStorage.setItem('one_time_prekeys', JSON.stringify(updatedKeys));

    console.log(`One-time prekey ${keyId} deleted for forward secrecy`);
  }
}