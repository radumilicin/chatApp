// hooks/useX3DH.ts - Update to handle async methods
import { useState } from 'react';
import { X3DHClient, KeyPair } from './x3dh-client';
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import { API_URL } from './config'

interface UserKeys {
  identityKey: KeyPair;
  signedPreKey: {
    keyId: number;
    publicKey: string;
    privateKey: string;
    signature: string;
  };
  oneTimePreKeys: Array<{
    keyId: number;
    publicKey: string;
    privateKey: string;
  }>;
}

export function useX3DH() {
  const [identityKey, setIdentityKey] = useState<KeyPair | null>(null);
  const [signedPreKey, setSignedPreKey] = useState<any>(null);
  const [oneTimePreKeys, setOneTimePreKeys] = useState<any[]>([]);
  const [isKeysLoaded, setIsKeysLoaded] = useState(false);

  const generateKeysForSignup = async (password: string, userId: string) => {
    const newIdentityKey = await X3DHClient.generateKeyPair();
    const signedPreKeyPair = await X3DHClient.generateKeyPair();
    const signature = await X3DHClient.sign(newIdentityKey.privateKey, signedPreKeyPair.publicKey);
    
    const newSignedPreKey = {
      keyId: 1,
      publicKey: signedPreKeyPair.publicKey,
      privateKey: signedPreKeyPair.privateKey,
      signature,
    };
    
    const newOneTimePreKeys = await X3DHClient.generateOneTimePreKeys(100, 1);
    
    // ✅ Pass password directly - encryptKeys will derive the key internally
    const encryptedKeys = encryptKeys(
      {
        identityKey: newIdentityKey,
        signedPreKey: newSignedPreKey,
        oneTimePreKeys: newOneTimePreKeys,
      },
      password  // Just pass the password string
    );
    
    // ✅ User-specific storage
    localStorage.setItem(`encrypted_keys_${userId}`, encryptedKeys);
    localStorage.setItem(`one_time_prekeys_${userId}`, JSON.stringify(newOneTimePreKeys));
    
    setIdentityKey(newIdentityKey);
    setSignedPreKey(newSignedPreKey);
    setOneTimePreKeys(newOneTimePreKeys);
    setIsKeysLoaded(true);
    
    return {
      identityKeyPublic: newIdentityKey.publicKey,
      signedPreKeyPublic: newSignedPreKey.publicKey,
      signedPreKeySignature: signature,
      oneTimePreKeysPublic: newOneTimePreKeys.map(k => ({
        keyId: k.keyId,
        publicKey: k.publicKey,
      })),
    };
  };

  // Load keys after login
  const loadKeysAfterLogin = async (userId: string, deviceKey: Uint8Array): Promise<boolean> => {
    try {
      // ✅ Load user-specific encrypted keys
      const encryptedKeys = localStorage.getItem(`encrypted_keys_${userId}`);
      if (!encryptedKeys) {
        console.log('No keys found locally for user:', userId);
        return false;
      }
      
      // ✅ Decrypt with device key (Uint8Array)
      const keys = decryptKeys(encryptedKeys, deviceKey);

      console.log("🔵 BOB LOADED KEYS FROM LOCALSTORAGE:");
      console.log("🔵 Bob's signed prekey public:", keys.signedPreKey.publicKey);
      console.log("🔵 Bob's signed prekey private:", keys.signedPreKey.privateKey.substring(0, 20));
    
      
      console.log("=============================")
      console.log("=== KEYS ARE SET IN STATE ===")
      console.log("=============================")

      setIdentityKey(keys.identityKey);
      setSignedPreKey(keys.signedPreKey);
      setOneTimePreKeys(keys.oneTimePreKeys);
      setIsKeysLoaded(true);
      
      return true;
    } catch (error) {
      console.error('Failed to decrypt keys:', error);
      return false;
    }
  }; 

  // Encrypt keys with NaCl
  function encryptKeys(keys: any, passwordOrKey: string | Uint8Array): string {
    // Derive encryption key from password if string, otherwise use provided key
    const encryptionKey = typeof passwordOrKey === 'string' 
      ? deriveKeyFromPassword(passwordOrKey)
      : passwordOrKey; // Already a 32-byte Uint8Array
    
    // Convert keys object to JSON string, then to bytes
    const plaintext = JSON.stringify(keys);
    const encoder = new TextEncoder();
    const plaintextBytes = encoder.encode(plaintext);
    
    // Generate random nonce (24 bytes for secretbox)
    const nonce = nacl.randomBytes(24);
    
    // Encrypt with NaCl secretbox
    const ciphertext = nacl.secretbox(plaintextBytes, nonce, encryptionKey);
    
    // Combine nonce + ciphertext
    const combined = new Uint8Array(nonce.length + ciphertext.length);
    combined.set(nonce, 0);
    combined.set(ciphertext, nonce.length);
    
    // Encode as base64
    return encodeBase64(combined);
  }

  // Decrypt keys with NaCl
  function decryptKeys(encryptedKeysBase64: string, passwordOrKey: string | Uint8Array): any {
    // Derive the same encryption key from password if string, otherwise use provided key
    const encryptionKey = typeof passwordOrKey === 'string'
      ? deriveKeyFromPassword(passwordOrKey)
      : passwordOrKey; // Already a 32-byte Uint8Array
    
    // Decode base64
    const combined = decodeBase64(encryptedKeysBase64);
    
    // Extract nonce (first 24 bytes) and ciphertext (rest)
    const nonce = combined.slice(0, 24);
    const ciphertext = combined.slice(24);
    
    // Decrypt with NaCl secretbox
    const plaintextBytes = nacl.secretbox.open(ciphertext, nonce, encryptionKey);
    
    if (!plaintextBytes) {
      throw new Error('Decryption failed - wrong password/key or corrupted data');
    }
    
    // Convert bytes back to string and parse JSON
    const decoder = new TextDecoder();
    const plaintext = decoder.decode(plaintextBytes);
    
    return JSON.parse(plaintext);
  }

  // Initiate chat (async now!)
  const initiateChat = async (recipientId: string) => {

    console.log("In initiate chat")

    if (!identityKey) {
      throw new Error('Keys not loaded. Call loadKeysAfterLogin first.');
    }

    
    const response = await fetch(`${API_URL}/api/keys?recipient_id=${recipientId}`);
    const rawBundle = await response.json();
    
    console.log("After getting bundle")

    const ephemeralKey = await X3DHClient.generateKeyPair();

    // const public_keys_recipient = {
    //   identityKey: resp_keys.rows[0].identity_key_public,
    //   signedPreKey: {
    //     key_id: resp_keys.rows[0].signed_prekey_id,
    //     public_key: resp_keys.rows[0].signed_prekey_public,
    //     signature: resp_keys.rows[0].signed_prekey_signature
    //   }, 
    //   oneTimePreKey: {
    //     keyId: resp_ot_keys.rows[0].key_id,
    //     publicKey: resp_ot_keys.rows[0].public_key
    //   }
    // }

    // Transform to consistent camelCase format
    const bundle = {
      identityKey: rawBundle.identityKey,
      signedPreKey: {
        keyId: rawBundle.signedPreKey.key_id,
        publicKey: rawBundle.signedPreKey.public_key, // Convert snake_case to camelCase
        signature: rawBundle.signedPreKey.signature
      },
      oneTimePreKey: undefined
      // oneTimePreKey: rawBundle.oneTimePreKey ? {
      //   keyId: rawBundle.oneTimePreKey.keyId,
      //   publicKey: rawBundle.oneTimePreKey.publicKey
      // } : undefined
    };

    console.log("🔴 TRANSFORMED BUNDLE:", JSON.stringify(bundle));
    console.log(`🔴 Bob's signed prekey we're using with recipient_id ${recipientId} :`, bundle.signedPreKey.publicKey);
 
    console.log("After calculating ephemeral key")
    console.log(`indentityKey = ${JSON.stringify(identityKey)}, ephemeralKey = ${JSON.stringify(ephemeralKey)}, bundle = ${JSON.stringify(bundle)}`)

    const result = await X3DHClient.initiateX3DH(identityKey, ephemeralKey, bundle);
   
    // Alice's side (after initiateX3DH)
    console.log("=== ALICE X3DH OUTPUT ===");
    console.log("Shared secret:", result.sharedSecret.substring(0, 30) + "...");
    console.log("Ephemeral public key:", result.ephemeralPublicKey.substring(0, 30) + "...");
    console.log("Using Bob's signed prekey:", bundle.signedPreKey.publicKey.substring(0, 30) + "...");

    console.log("After calculating shared secret")

    return {
      sharedSecret: result.sharedSecret,
      ephemeralPublicKey: result.ephemeralPublicKey,
      oneTimePreKeyId: bundle.oneTimePreKey?.keyId,
      bundle: bundle,
    };
  };

  // Perform X3DH as receiver (async now!)
  const performX3DHAsReceiver = async (
    theirEphemeralKey: string,
    theirIdentityKey: string,
    oneTimePreKeyId?: number
  ): Promise<string> => {
    if (!identityKey || !signedPreKey) {
      throw new Error('Keys not loaded. Call loadKeysAfterLogin first.');
    }

    return await X3DHClient.performX3DHAsReceiver(
      identityKey,
      signedPreKey,
      theirEphemeralKey,
      theirIdentityKey,
      oneTimePreKeyId
    );
  };

  const clearKeys = () => {
    setIdentityKey(null);
    setSignedPreKey(null);
    setOneTimePreKeys([]);
    setIsKeysLoaded(false);
  };

  return {
    identityKey,
    signedPreKey,
    isKeysLoaded,
    generateKeysForSignup,
    loadKeysAfterLogin,
    initiateChat,
    performX3DHAsReceiver,
    setIdentityKey,
    setSignedPreKey,
    setOneTimePreKeys,
    encryptKeys,
    decryptKeys,
    clearKeys,
  };
}

// Derive a 32-byte key from password using NaCl hash (synchronous)
function deriveKeyFromPassword(password: string): Uint8Array {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  
  // Use nacl.hash to create a 64-byte hash, then take first 32 bytes for key
  const hash = nacl.hash(passwordBytes);
  return hash.slice(0, 32); // NaCl secretbox needs 32-byte key
}

async function encryptKeys(keys: UserKeys, encryptionKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(keys));
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    encryptionKey,
    data
  );
  
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedData), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

async function decryptKeys(encryptedString: string, encryptionKey: CryptoKey): Promise<UserKeys> {
  const combined = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));
  
  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);
  
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    encryptionKey,
    encryptedData
  );
  
  const decoder = new TextDecoder();
  const jsonString = decoder.decode(decryptedData);
  
  return JSON.parse(jsonString);
}
