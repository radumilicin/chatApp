// lib/double-ratchet.ts
import crypto from 'crypto';

export interface RatchetState {
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
    this.state = state;
  }

  // Initialize as sender (Alice) after X3DH
  static initializeAsSender(
    sharedSecret: string,
    theirSignedPreKey: string
  ): DoubleRatchet {
    // Generate our first DH ratchet key
    const dhKeyPair = DoubleRatchet.generateKeyPair();

    // Derive root key and sending chain key from shared secret
    const { rootKey, chainKey } = DoubleRatchet.kdfRootKey(
      sharedSecret,
      DoubleRatchet.dh(dhKeyPair.privateKey, theirSignedPreKey)
    );

    return new DoubleRatchet({
      rootKey,
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
    sharedSecret: string,
    mySignedPreKey: { publicKey: string; privateKey: string }
  ): DoubleRatchet {
    return new DoubleRatchet({
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
  encrypt(plaintext: string): {
    ciphertext: string;
    header: {
      dhPublicKey: string;
      messageNumber: number;
      previousChainLength: number;
    };
  } {
    // Derive message key from chain key
    const { messageKey, nextChainKey } = DoubleRatchet.kdfChainKey(
      this.state.sendingChainKey
    );

    // Encrypt the message
    const ciphertext = DoubleRatchet.encryptMessage(plaintext, messageKey);

    // Create header
    const header = {
      dhPublicKey: this.state.dhSendingKey.publicKey,
      messageNumber: this.state.sendMessageNumber,
      previousChainLength: this.state.previousSendingChainLength,
    };

    // Update state
    this.state.sendingChainKey = nextChainKey;
    this.state.sendMessageNumber++;

    return { ciphertext, header };
  }

  // Decrypt a message
  decrypt(
    ciphertext: string,
    header: {
      dhPublicKey: string;
      messageNumber: number;
      previousChainLength: number;
    }
  ): string {
    // Check if we need to perform DH ratchet step
    if (header.dhPublicKey !== this.state.dhReceivingKey) {
      this.dhRatchetStep(header);
    }

    // Derive the message key
    let chainKey = this.state.receivingChainKey;
    for (let i = this.state.receiveMessageNumber; i < header.messageNumber; i++) {
      const result = DoubleRatchet.kdfChainKey(chainKey);
      chainKey = result.nextChainKey;
      // In a real implementation, store skipped message keys for out-of-order messages
    }

    const { messageKey, nextChainKey } = DoubleRatchet.kdfChainKey(chainKey);

    // Decrypt the message
    const plaintext = DoubleRatchet.decryptMessage(ciphertext, messageKey);

    // Update state
    this.state.receivingChainKey = nextChainKey;
    this.state.receiveMessageNumber++;

    return plaintext;
  }

  // Perform DH ratchet step (when receiving new DH key from other party)
  private dhRatchetStep(header: {
    dhPublicKey: string;
    messageNumber: number;
    previousChainLength: number;
  }): void {
    // Store previous chain length
    this.state.previousSendingChainLength = this.state.sendMessageNumber;

    // Reset receive message number
    this.state.receiveMessageNumber = 0;

    // Update their DH key
    this.state.dhReceivingKey = header.dhPublicKey;

    // Derive new receiving chain
    const { rootKey: newRootKey1, chainKey: receivingChainKey } =
      DoubleRatchet.kdfRootKey(
        this.state.rootKey,
        DoubleRatchet.dh(this.state.dhSendingKey.privateKey, header.dhPublicKey)
      );
    this.state.rootKey = newRootKey1;
    this.state.receivingChainKey = receivingChainKey;

    // Generate new DH key pair
    this.state.dhSendingKey = DoubleRatchet.generateKeyPair();

    // Derive new sending chain
    const { rootKey: newRootKey2, chainKey: sendingChainKey } =
      DoubleRatchet.kdfRootKey(
        this.state.rootKey,
        DoubleRatchet.dh(
          this.state.dhSendingKey.privateKey,
          header.dhPublicKey
        )
      );
    this.state.rootKey = newRootKey2;
    this.state.sendingChainKey = sendingChainKey;
    this.state.sendMessageNumber = 0;
  }

  // Get current state (for saving)
  getState(): RatchetState {
    return { ...this.state };
  }

  // Cryptographic primitives

  private static generateKeyPair(): {
    publicKey: string;
    privateKey: string;
  } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('x25519');
    return {
      publicKey: publicKey.export({ type: 'spki', format: 'der' }).toString('base64'),
      privateKey: privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64'),
    };
  }

  private static dh(privateKeyBase64: string, publicKeyBase64: string): string {
    const privKey = crypto.createPrivateKey({
      key: Buffer.from(privateKeyBase64, 'base64'),
      format: 'der',
      type: 'pkcs8',
    });
    const pubKey = crypto.createPublicKey({
      key: Buffer.from(publicKeyBase64, 'base64'),
      format: 'der',
      type: 'spki',
    });
    return crypto
      .diffieHellman({ privateKey: privKey, publicKey: pubKey })
      .toString('base64');
  }

  private static kdfRootKey(
    rootKey: string,
    dhOutput: string
  ): { rootKey: string; chainKey: string } {
    const input = Buffer.concat([
      Buffer.from(rootKey, 'base64'),
      Buffer.from(dhOutput, 'base64'),
    ]);
    const output = crypto.hkdfSync('sha256', input, '', 'root-chain', 64);
    
    return {
      rootKey: output.subarray(0, 32).toString('base64'),
      chainKey: output.subarray(32, 64).toString('base64'),
    };
  }

  private static kdfChainKey(chainKey: string): {
    messageKey: string;
    nextChainKey: string;
  } {
    const input = Buffer.from(chainKey, 'base64');
    
    // Message key
    const messageKey = crypto
      .createHmac('sha256', input)
      .update('message')
      .digest()
      .toString('base64');
    
    // Next chain key
    const nextChainKey = crypto
      .createHmac('sha256', input)
      .update('chain')
      .digest()
      .toString('base64');
    
    return { messageKey, nextChainKey };
  }

  private static encryptMessage(plaintext: string, messageKey: string): string {
    const key = Buffer.from(messageKey, 'base64');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Prepend IV to ciphertext
    return iv.toString('base64') + ':' + encrypted;
  }

  private static decryptMessage(ciphertext: string, messageKey: string): string {
    const [ivBase64, encryptedBase64] = ciphertext.split(':');
    const key = Buffer.from(messageKey, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
