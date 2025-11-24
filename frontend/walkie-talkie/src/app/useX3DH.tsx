// hooks/useX3DH.ts - Update to handle async methods
import { useState } from 'react';
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

  // Generate keys for signup
  const generateKeysForSignup = async (password: string) => {
    const newIdentityKey = await X3DHClient.generateKeyPair();

    X3DHClient.debugKeyFormat(newIdentityKey.publicKey, 'identityKey.publicKey')
    X3DHClient.debugKeyFormat(newIdentityKey.privateKey, 'identityKey.privateKey')

    const signedPreKeyPair = await X3DHClient.generateKeyPair();

    X3DHClient.debugKeyFormat(signedPreKeyPair.publicKey, 'signedPreKeyPair.publicKey')
    X3DHClient.debugKeyFormat(signedPreKeyPair.privateKey, 'signedPreKeyPair.privateKey')

    const signature = await X3DHClient.sign(newIdentityKey.privateKey, signedPreKeyPair.publicKey);
    
    const newSignedPreKey = {
      keyId: 1,
      publicKey: signedPreKeyPair.publicKey,
      privateKey: signedPreKeyPair.privateKey,
      signature,
    };

    const newOneTimePreKeys = await X3DHClient.generateOneTimePreKeys(100, 1);

    const encryptionKey = await deriveKeyFromPassword(password);
    const encryptedKeys = await encryptKeys(
      {
        identityKey: newIdentityKey,
        signedPreKey: newSignedPreKey,
        oneTimePreKeys: newOneTimePreKeys,
      },
      encryptionKey
    );

    localStorage.setItem('encrypted_keys', encryptedKeys);
    localStorage.setItem('one_time_prekeys', JSON.stringify(newOneTimePreKeys));

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
  const loadKeysAfterLogin = async (userId: string, password: string) => {
    try {
      const encryptedKeys = localStorage.getItem('encrypted_keys');
      
      if (!encryptedKeys) {
        console.error('No keys found locally.');
        return false;
      }

      const encryptionKey = await deriveKeyFromPassword(password);
      const keys = await decryptKeys(encryptedKeys, encryptionKey);

      setIdentityKey(keys.identityKey);
      setSignedPreKey(keys.signedPreKey);
      setOneTimePreKeys(keys.oneTimePreKeys);
      
      localStorage.setItem('one_time_prekeys', JSON.stringify(keys.oneTimePreKeys));
      
      setIsKeysLoaded(true);

      return true;
    } catch (error) {
      console.error('Failed to decrypt keys:', error);
      return false;
    }
  };

  // Initiate chat (async now!)
  const initiateChat = async (recipientId: string) => {

    console.log("In initiate chat")

    if (!identityKey) {
      throw new Error('Keys not loaded. Call loadKeysAfterLogin first.');
    }

    
    const response = await fetch(`http://localhost:3002/api/keys?recipient_id=${recipientId}`);
    const rawBundle = await response.json();
    
    console.log("After getting bundle")

    const ephemeralKey = await X3DHClient.generateKeyPair();

    // Transform to consistent camelCase format
    const bundle = {
      identityKey: rawBundle.identityKey,
      signedPreKey: {
        keyId: rawBundle.signedPreKey.key_id,
        publicKey: rawBundle.signedPreKey.public_key, // Convert snake_case to camelCase
        signature: rawBundle.signedPreKey.signature
      },
      oneTimePreKey: rawBundle.oneTimePreKey ? {
        keyId: rawBundle.oneTimePreKey.keyId,
        publicKey: rawBundle.oneTimePreKey.publicKey
      } : undefined
    };
 
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
    clearKeys,
  };
}

// Crypto helpers (keep existing implementations)
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
