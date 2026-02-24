// lib/double-ratchet.ts
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import { SERVER, PORT_SERVER } from './config'

export interface RatchetState {
  user: string;
  conversation_id: string;
  rootKey: string;              // Root key (RK)
  sendingChainKey: string;      // Chain key for sending (CKs)
  receivingChainKey: string;    // Chain key for receiving (CKr)
  dhSendingKey: { publicKey: string; privateKey: string };  // Our current DH key pair
  dhReceivingKey: string | null; // Their current DH public key
  sendMessageNumber: number;     // Ns
  receiveMessageNumber: number;  // Nr
  previousSendingChainLength: number; // PN
}

export class DoubleRatchet {
  private state: RatchetState;

  constructor(state: RatchetState) {
    // Validate and clean up the state
    this.state = {
      ...state,
      // Fix stringified null/undefined
      dhReceivingKey: state.dhReceivingKey === 'null' || 
                      state.dhReceivingKey === 'undefined' || 
                      state.dhReceivingKey === '' 
        ? null 
        : state.dhReceivingKey,
      // Ensure chain keys are never undefined
      sendingChainKey: state.sendingChainKey || '',
      receivingChainKey: state.receivingChainKey || '',
    };
    
    console.log('DoubleRatchet initialized with state:', {
      dhReceivingKey: this.state.dhReceivingKey,
      dhSendingPublicKey: this.state.dhSendingKey.publicKey.substring(0, 20) + '...',
    });
  }

  // Initialize as sender (Alice) after X3DH
  static initializeAsSender(
    user: string, 
    conversation_id: string,
    sharedSecret: string,
    theirSignedPreKey: string
  ): DoubleRatchet {
    // Generate our first DH ratchet key (using same method as X3DHClient)
    const dhKeyPair = DoubleRatchet.generateKeyPair();
  
    console.log('🔴 ALICE INIT - X3DH sharedSecret:', sharedSecret.substring(0, 20));
    console.log('🔴 ALICE INIT - Bob signed prekey:', theirSignedPreKey.substring(0, 20));
    console.log('🔴 ALICE INIT - Alice DH private:', dhKeyPair.privateKey.substring(0, 20));
    console.log('🔴 ALICE INIT - Alice DH public:', dhKeyPair.publicKey.substring(0, 20));
    
    const dhOutput = DoubleRatchet.dh(dhKeyPair.privateKey, theirSignedPreKey);
    console.log('🔴 ALICE INIT - DH output:', dhOutput.substring(0, 20));
    
    const { rootKey, chainKey } = DoubleRatchet.kdfRootKey(sharedSecret, dhOutput);
    console.log('🔴 ALICE INIT - New root key:', rootKey.substring(0, 20));
    console.log('🔴 ALICE INIT - Sending chain key:', chainKey); // FULL KEY!

    return new DoubleRatchet({
      user: user,
      conversation_id: conversation_id,
      rootKey: rootKey,
      sendingChainKey: chainKey,
      receivingChainKey: '', // Will be set when we receive their first message
      dhSendingKey: dhKeyPair,
      dhReceivingKey: theirSignedPreKey,
      sendMessageNumber: 0,
      receiveMessageNumber: 0,
      previousSendingChainLength: 0,
    });
  }

  // Initialize as receiver (Bob) after X3DH
  static initializeAsReceiver(
    user: string,
    conversation_id: string,
    sharedSecret: string,
    mySignedPreKey: { publicKey: string; privateKey: string }
  ): DoubleRatchet {

    /* HERE TAKE FROM localStorage the send and receive numbers if they exist */
    return new DoubleRatchet({
      user: user,
      conversation_id: conversation_id,
      rootKey: sharedSecret,
      sendingChainKey: '',
      receivingChainKey: '',
      dhSendingKey: mySignedPreKey,
      dhReceivingKey: null,
      sendMessageNumber: 0,
      receiveMessageNumber: 0,
      previousSendingChainLength: 0,
    });
  }

  // Encrypt a message
  async encrypt(plaintext: string): Promise<{
    ciphertext: string;
    header: {
      dhPublicKey: string;
      messageNumber: number;
      previousChainLength: number;
    };
  }> {
    
    const time1 = new Date()
    console.log(`in user ${this.state.user} before encrypt sendMessageNumber: ` + this.state.sendMessageNumber + 
                "receiveMessageNumber: " + this.state.receiveMessageNumber +
                ", time: " + time1.getHours() + ":" + time1.getMinutes() + ":" + time1.getSeconds());

    console.log("=== ALICE ENCRYPT ===");
    console.log("Alice's ratchet state:", {
      sendMessageNumber: this.state.sendMessageNumber,
      rootKey: this.state.rootKey.substring(0, 20) + "...",
      sendingChainKey: this.state.sendingChainKey.substring(0, 20) + "...",
      dhSendingPublicKey: this.state.dhSendingKey.publicKey.substring(0, 20) + "...",
      dhReceivingKey: this.state.dhReceivingKey?.substring(0, 20) + "..."
    });

    // Derive message key from chain key
    const { messageKey, nextChainKey } = DoubleRatchet.kdfChainKey(
      this.state.sendingChainKey
    );
    
    console.log("Message key in Alice:", messageKey.substring(0, 20) + "...");

    // Encrypt the message
    const ciphertext = DoubleRatchet.encryptMessage(plaintext, messageKey);

    // Create header
    const header = {
      dhPublicKey: this.state.dhSendingKey.publicKey,
      messageNumber: this.state.sendMessageNumber,
      previousChainLength: this.state.previousSendingChainLength,
    };

    console.log("Header for encryption:", {
      dhPublicKey: header.dhPublicKey + "...",
      messageNumber: header.messageNumber,
      previousChainLength: header.previousChainLength
    });


    // Update state
    this.state.sendingChainKey = nextChainKey;
    this.state.sendMessageNumber++;

    await this.updateRatchetState();

    const time = new Date()
    console.log(`in user ${this.state.user} after encrypt sendMessageNumber: ` + this.state.sendMessageNumber + 
                "receiveMessageNumber: " + this.state.receiveMessageNumber +
                ", time: " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds());

    return { ciphertext, header };
  }

  async decrypt(
    ciphertext: string,
    header: {
      dhPublicKey: string;
      messageNumber: number;
      previousChainLength: number;
    } | string // Accept both object and string
  ): Promise<string> {

    const time1 = new Date()
    console.log(`in user ${this.state.user} before decrypt sendMessageNumber: ` + this.state.sendMessageNumber + 
                "receiveMessageNumber: " + this.state.receiveMessageNumber +
                ", time: " + time1.getHours() + ":" + time1.getMinutes() + ":" + time1.getSeconds());


    const time_ = time1.getHours() + ":" + time1.getMinutes() + ":" + time1.getSeconds();
    // Parse header if it's a string
    const parsedHeader = typeof header === 'string' ? JSON.parse(header) : header;
    
    console.log("=== BOB DECRYPT ===");
    console.log("Bob's ratchet state BEFORE:", {
      receiveMessageNumber: this.state.receiveMessageNumber,
      rootKey: this.state.rootKey.substring(0, 20) + "...",
      receivingChainKey: this.state.receivingChainKey.substring(0, 20) + "...",
      dhSendingPublicKey: this.state.dhSendingKey.publicKey.substring(0, 20) + "...",
      dhReceivingKey: this.state.dhReceivingKey === null 
        ? "null" 
        : this.state.dhReceivingKey.substring(0, 20) + "..."  // ← Fixed
    });
    

    console.log("Header in decryption:", {            // THIS IS CORRECT (HEADERS MATCH)
      dhPublicKey: parsedHeader.dhPublicKey + "...",
      messageNumber: parsedHeader.messageNumber,
      previousChainLength: parsedHeader.previousChainLength
    }); 

    console.log(`this.state.dhReceivingKey = ${this.state.dhReceivingKey}, parsedHeader.dhPublicKey = ${parsedHeader.dhPublicKey} at time: ${time_} with user: ${this.state.user} \n 🔍 Are they equal? ${parsedHeader.dhPublicKey === this.state.dhReceivingKey}`)
    
    // Check if we need to perform DH ratchet step
    if (this.state.dhReceivingKey === null  || parsedHeader.dhPublicKey !== this.state.dhReceivingKey) {
      console.log(`First message or DH keys changed - performing DH ratchet step ${this.state.user}`);
      this.dhRatchetStep(parsedHeader);
    }

    console.log("Bob's ratchet state AFTER ratchet step:", {
      receivingChainKey: this.state.receivingChainKey.substring(0, 20) + "...",
    });


    // Derive the message key
    let chainKey = this.state.receivingChainKey;
    console.log(`receiving chain key in receiver: ${chainKey}`)
    for (let i = this.state.receiveMessageNumber; i < parsedHeader.messageNumber; i++) {
      const result = DoubleRatchet.kdfChainKey(chainKey);
      chainKey = result.nextChainKey;
    }
    console.log(`receiving chain key in receiver after for: ${chainKey}`)
    
    console.log("Before deriving chain key")

    const { messageKey, nextChainKey } = DoubleRatchet.kdfChainKey(chainKey);
    
    console.log(`After deriving message key in Bob: ${messageKey}`)

    // Decrypt the message
    const plaintext = DoubleRatchet.decryptMessage(ciphertext, messageKey);
    
    console.log(`plaintext is ${plaintext}`)

    // Update state
    this.state.receivingChainKey = nextChainKey;
    this.state.receiveMessageNumber++;

    await this.updateRatchetState();

    const time = new Date()
    console.log(`in user ${this.state.user} after decrypt receiveMessageNumber: ` + this.state.receiveMessageNumber + 
                "sendMessageNumber: " + this.state.sendMessageNumber +
                ", time: " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds());
    // console.log(`receiveMessageNumber: ${this.state.receiveMessageNumber}`)

    return plaintext;
  }

  // Add this helper method to the class
  private async updateRatchetState(): Promise<void> {
    try {
      const resp = await fetch(`http://${SERVER}:${PORT_SERVER}/updateRatchetState`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: this.state.user,
          conversation_id: this.state.conversation_id,
          send_message_number: this.state.sendMessageNumber,
          receive_message_number: this.state.receiveMessageNumber,
          send_chain_key: this.state.sendingChainKey,
          receive_chain_key: this.state.receivingChainKey,
          root_key: this.state.rootKey,
          dh_sending_key: JSON.stringify(this.state.dhSendingKey),
          dh_receiving_key: this.state.dhReceivingKey || '',
          previous_sending_chain_length: this.state.previousSendingChainLength,
        }),
      });

      if(resp.ok) {
        console.log("Ratchet state updated successfully")
      } else {
        console.log(`Ratchet state could not be updated err ${resp.status}`);
      }

    } catch (error) {
      console.error('Failed to update ratchet state:', error);
      // Don't throw - crypto operations should succeed even if persistence fails
    }
  }

  // Perform DH ratchet step (when receiving new DH key from other party)
  private dhRatchetStep(header: {
    dhPublicKey: string;
    messageNumber: number;
    previousChainLength: number;
  }): void {

    console.log(`🟢 dhRatchetStep START ${this.state.user}`);
    
    console.log('🔵 BOB RATCHET - X3DH sharedSecret (rootKey):', this.state.rootKey.substring(0, 20));
    console.log('🔵 BOB RATCHET - Alice DH public (from header):', header.dhPublicKey.substring(0, 20));
    console.log('🔵 BOB RATCHET - Bob signed prekey private:', this.state.dhSendingKey.privateKey.substring(0, 20));
    console.log('🔵 BOB RATCHET - Bob signed prekey public:', this.state.dhSendingKey.publicKey.substring(0, 20));
    
    this.state.previousSendingChainLength = this.state.sendMessageNumber;
    this.state.receiveMessageNumber = 0;
    this.state.dhReceivingKey = header.dhPublicKey;
    
    const dhOutput1 = DoubleRatchet.dh(this.state.dhSendingKey.privateKey, header.dhPublicKey);
    console.log('🔵 BOB RATCHET - DH output 1:', dhOutput1.substring(0, 20));
    
    const { rootKey: newRootKey1, chainKey: receivingChainKey } = 
      DoubleRatchet.kdfRootKey(this.state.rootKey, dhOutput1);
    
    console.log('🔵 BOB RATCHET - New root key 1:', newRootKey1.substring(0, 20));
    console.log('🔵 BOB RATCHET - Receiving chain key:', receivingChainKey); // FULL KEY!
    
    this.state.rootKey = newRootKey1;
    this.state.receivingChainKey = receivingChainKey;
    
    // ✅ Generate new DH key pair for next sending ratchet
    this.state.dhSendingKey = DoubleRatchet.generateKeyPair();
    console.log('🟢 Generated new DH sending key:', this.state.dhSendingKey.publicKey.substring(0, 20));
    
    // ✅ Second DH: Derive sending chain from our new key + their key
    const dhOutput2 = DoubleRatchet.dh(this.state.dhSendingKey.privateKey, header.dhPublicKey);
    console.log('🟢 DH output 2:', dhOutput2.substring(0, 20));
    
    const { rootKey: newRootKey2, chainKey: sendingChainKey } = 
      DoubleRatchet.kdfRootKey(this.state.rootKey, dhOutput2);
    
    console.log('🟢 New root key 2:', newRootKey2.substring(0, 20));
    console.log('🟢 Sending chain key:', sendingChainKey.substring(0, 20));
    
    this.state.rootKey = newRootKey2;
    this.state.sendingChainKey = sendingChainKey;
    this.state.sendMessageNumber = 0;
   
    const time = new Date()
    
    console.log(`🟢 dhRatchetStep END - Final state at ${time.getHours()}::${time.getMinutes()}::${time.getSeconds()}:`, {
      rootKey: this.state.rootKey.substring(0, 20),
      receivingChainKey: this.state.receivingChainKey.substring(0, 20),
      sendingChainKey: this.state.sendingChainKey.substring(0, 20)
    });
  }

  // Get current state (for saving)
  getState(): RatchetState {
    return { ...this.state };
  }

  // Cryptographic primitives

  // Generate X25519 key pair (same as X3DHClient)
  private static generateKeyPair(): {
    publicKey: string;
    privateKey: string;
  } {
    const keyPair = nacl.box.keyPair();
    
    return {
      publicKey: encodeBase64(keyPair.publicKey),
      privateKey: encodeBase64(keyPair.secretKey),
    };
  }

  // Diffie-Hellman using TweetNaCl (same as X3DHClient)
  private static dh(privateKeyBase64: string, publicKeyBase64: string): string {
    const privateKey = decodeBase64(privateKeyBase64);
    const publicKey = decodeBase64(publicKeyBase64);
    
    // Perform X25519 scalar multiplication
    const sharedSecret = nacl.scalarMult(privateKey, publicKey);
    
    return encodeBase64(sharedSecret);
  }

  private static kdfRootKey(
    rootKey: string,
    dhOutput: string
  ): { rootKey: string; chainKey: string } {
    const rootKeyBytes = decodeBase64(rootKey);
    const dhOutputBytes = decodeBase64(dhOutput);
    
    // Concatenate inputs
    const input = new Uint8Array(rootKeyBytes.length + dhOutputBytes.length);
    input.set(rootKeyBytes, 0);
    input.set(dhOutputBytes, rootKeyBytes.length);
    
    // Use HKDF to derive 64 bytes (32 for root key, 32 for chain key)
    const output = DoubleRatchet.hkdf(input, 64, new Uint8Array(0));
    
    return {
      rootKey: encodeBase64(output.subarray(0, 32)),
      chainKey: encodeBase64(output.subarray(32, 64)),
    };
  }

  // Add this helper function to your DoubleRatchet class
  private static hmacSha256(key: Uint8Array, message: Uint8Array): Uint8Array {
    const blockSize = 64; // SHA-256 block size
    
    // If key is longer than block size, hash it first
    let keyBytes = key;
    if (key.length > blockSize) {
      keyBytes = nacl.hash(key).subarray(0, 32);
    }
    
    // Pad key to block size
    const paddedKey = new Uint8Array(blockSize);
    paddedKey.set(keyBytes);
    
    // Create inner and outer padded keys
    const innerPad = new Uint8Array(blockSize);
    const outerPad = new Uint8Array(blockSize);
    
    for (let i = 0; i < blockSize; i++) {
      innerPad[i] = paddedKey[i] ^ 0x36;
      outerPad[i] = paddedKey[i] ^ 0x5c;
    }
    
    // HMAC = hash(outerPad || hash(innerPad || message))
    const innerInput = new Uint8Array(blockSize + message.length);
    innerInput.set(innerPad);
    innerInput.set(message, blockSize);
    const innerHash = nacl.hash(innerInput);
    
    const outerInput = new Uint8Array(blockSize + innerHash.length);
    outerInput.set(outerPad);
    outerInput.set(innerHash, blockSize);
    const outerHash = nacl.hash(outerInput);
    
    // Return first 32 bytes
    return outerHash.subarray(0, 32);
  }

  private static kdfChainKey(chainKey: string): {
    messageKey: string;
    nextChainKey: string;
  } {
    const chainKeyBytes = decodeBase64(chainKey);
    
    // Message key - HMAC(chainKey, "message")
    const messageKeyBytes = DoubleRatchet.hmacSha256(
      chainKeyBytes,
      new TextEncoder().encode('message')
    );
    
    // Next chain key - HMAC(chainKey, "chain")  
    const nextChainKeyBytes = DoubleRatchet.hmacSha256(
      chainKeyBytes,
      new TextEncoder().encode('chain')
    );
    
    return {
      messageKey: encodeBase64(messageKeyBytes),
      nextChainKey: encodeBase64(nextChainKeyBytes),
    };
  } 

  private static encryptMessage(plaintext: string, messageKey: string): string {
    const key = decodeBase64(messageKey);
    const plaintextBytes = new TextEncoder().encode(plaintext);
    
    // Generate random nonce (24 bytes for nacl.secretbox)
    const nonce = nacl.randomBytes(24);
    
    // Encrypt using nacl.secretbox (XSalsa20-Poly1305)
    const ciphertext = nacl.secretbox(plaintextBytes, nonce, key);
    
    // Combine nonce and ciphertext
    const combined = new Uint8Array(nonce.length + ciphertext.length);
    combined.set(nonce, 0);
    combined.set(ciphertext, nonce.length);
    
    return encodeBase64(combined);
  }

  private static decryptMessage(ciphertext: string, messageKey: string): string {

    console.log("In decrypt message")
    const key = decodeBase64(messageKey);
    const combined = decodeBase64(ciphertext);
    
    // Extract nonce and ciphertext
    const nonce = combined.subarray(0, 24);
    const encryptedBytes = combined.subarray(24);
    
    console.log("After deriving nonce & encryptedBytes")
    
    // Decrypt using nacl.secretbox
    const decrypted = nacl.secretbox.open(encryptedBytes, nonce, key);
    
    if (!decrypted) {
      throw new Error('Decryption failed');
    }
    
    return new TextDecoder().decode(decrypted);
  }

  // HKDF implementation using nacl.hash (SHA-512)
  private static hkdf(
    inputKeyMaterial: Uint8Array,
    length: number,
    info: Uint8Array
  ): Uint8Array {
    // Since nacl only provides SHA-512, we'll use a simplified HKDF
    // HKDF-Extract: Hash the input key material
    const prk = nacl.hash(inputKeyMaterial).subarray(0, 32); // Use first 32 bytes
    
    // HKDF-Expand: Generate output key material
    const n = Math.ceil(length / 32); // Number of iterations needed
    const output = new Uint8Array(n * 32);
    
    let t = new Uint8Array(0);
    for (let i = 0; i < n; i++) {
      const input = new Uint8Array(t.length + prk.length + info.length + 1);
      input.set(t, 0);
      input.set(prk, t.length);
      input.set(info, t.length + prk.length);
      input[input.length - 1] = i + 1;
      
      const hash = nacl.hash(input);
      t = new Uint8Array(hash.subarray(0, 32));
      output.set(t, i * 32);
    }

    return new Uint8Array(output.subarray(0, length));
  }
}