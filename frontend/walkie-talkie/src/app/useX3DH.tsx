// hooks/useX3DH.ts
import { useState, useEffect } from 'react';
import { X3DHClient, KeyPair } from './x3dh-client';

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

  // Generate keys for NEW USER (during signup, before account exists)
  const generateKeysForSignup = async (password: string) => {
    // 1. Generate identity key
    const newIdentityKey = X3DHClient.generateSigningKeyPair();
    
    // 2. Generate signed prekey
    const signedPreKeyPair = X3DHClient.generateSigningKeyPair();
    const signature = X3DHClient.sign(newIdentityKey.privateKey, signedPreKeyPair.publicKey);
    const newSignedPreKey = {
      keyId: 1,
      publicKey: signedPreKeyPair.publicKey,
      privateKey: signedPreKeyPair.privateKey,
      signature,
    };

    // 3. Generate one-time prekeys
    const newOneTimePreKeys = X3DHClient.generateOneTimePreKeys(100, 1);

    // 4. Encrypt private keys with password
    const encryptionKey = await deriveKeyFromPassword(password);
    const encryptedKeys = await encryptKeys(
      {
        identityKey: newIdentityKey,
        signedPreKey: newSignedPreKey,
        oneTimePreKeys: newOneTimePreKeys,
      },
      encryptionKey
    );

    // 5. Store encrypted keys locally (before signup API call)
    localStorage.setItem('encrypted_keys', encryptedKeys);

    setIdentityKey(newIdentityKey);
    setSignedPreKey(newSignedPreKey);
    setOneTimePreKeys(newOneTimePreKeys);
    setIsKeysLoaded(true);

    // Return PUBLIC keys to send to server during signup
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

  // Load keys for EXISTING USER (after login)
  const loadKeysAfterLogin = async (userId: string, password: string) => {
    try {
      // 1. Try to load encrypted keys from localStorage
      const encryptedKeys = localStorage.getItem('encrypted_keys');
      
      if (!encryptedKeys) {
        console.error('No keys found locally. Need to restore from backup or generate new keys.');
        return false;
      }

      // 2. Decrypt keys using password
      const encryptionKey = await deriveKeyFromPassword(password);
      const keys = await decryptKeys(encryptedKeys, encryptionKey);

      // 3. Set keys in state
      setIdentityKey(keys.identityKey);
      setSignedPreKey(keys.signedPreKey);
      setOneTimePreKeys(keys.oneTimePreKeys);
      setIsKeysLoaded(true);

      return true;
    } catch (error) {
      console.error('Failed to decrypt keys. Wrong password?', error);
      return false;
    }
  };

  // Initiate chat with another user
  const initiateChat = async (recipientId: string) => {
    if (!identityKey) {
      throw new Error('Keys not loaded. Call loadKeysAfterLogin first.');
    }

    // Fetch recipient's prekey bundle
    const response = await fetch(`http://localhost:3002/api/keys/recipient_id=${recipientId}`);
    const bundle = await response.json();

    // Generate ephemeral key
    const ephemeralKey = X3DHClient.generateKeyPair();

    // Perform X3DH
    const result = X3DHClient.initiateX3DH(identityKey, ephemeralKey, bundle);

    return {
      sharedSecret: result.sharedSecret,
      ephemeralPublicKey: result.ephemeralPublicKey,
      oneTimePreKeyId: bundle.oneTimePreKey?.keyId,
    };
  };

  // Clear keys on logout
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
    clearKeys,
  };
}

// Crypto helpers
async function deriveKeyFromPassword(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const importedKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Use a consistent salt (in production, store this securely)
  const salt = encoder.encode('your-app-salt-v1');
  
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    importedKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
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
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedData), iv.length);
  
  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

async function decryptKeys(encryptedString: string, encryptionKey: CryptoKey): Promise<UserKeys> {
  // Decode base64
  const combined = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));
  
  // Extract IV and encrypted data
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
