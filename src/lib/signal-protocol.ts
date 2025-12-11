'use client';

import {
  SignalProtocolStore,
  KeyHelper,
  SessionBuilder,
  SessionCipher,
  PreKeyBundle,
  SignalProtocolAddress,
} from '@privacyresearch/libsignal-protocol-typescript';

// In-memory store for demonstration purposes.
// In a real app, you would use IndexedDB for persistence.
class SignalProtocolStoreImpl implements SignalProtocolStore {
  private store: { [key: string]: any } = {};

  constructor() {
    if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('signal-store');
        if (stored) {
            this.store = JSON.parse(stored, (key, value) => {
              if (typeof value === 'object' && value !== null && value.type === 'Buffer') {
                return Buffer.from(value.data);
              }
              return value;
            });
        }
    }
  }

  private save() {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('signal-store', JSON.stringify(this.store));
      }
  }

  put(key: string, value: any): Promise<void> {
    this.store[key] = value;
    this.save();
    return Promise.resolve();
  }
  get(key: string, defaultValue: any): Promise<any> {
    return Promise.resolve(this.store[key] || defaultValue);
  }
  remove(key: string): Promise<void> {
    delete this.store[key];
    this.save();
    return Promise.resolve();
  }
  async getIdentityKeyPair(): Promise<any> {
    const keyPair = await this.get('identityKey', undefined);
    return keyPair;
  }
  async getLocalRegistrationId(): Promise<number | undefined> {
    return this.get('registrationId', undefined);
  }
  isTrustedIdentity(
    identifier: string,
    identityKey: ArrayBuffer,
    _direction: number
  ): Promise<boolean> {
    // In a real app, you would have a mechanism to verify identities.
    return Promise.resolve(true);
  }
  loadPreKey(keyId: number): Promise<any> {
    return this.get('25519-preKey-' + keyId, undefined);
  }
  loadSession(identifier: string): Promise<string | undefined> {
    return this.get('session-' + identifier, undefined);
  }
  loadSignedPreKey(keyId: number): Promise<any> {
    return this.get('25519-signed-preKey-' + keyId, undefined);
  }
  removePreKey(keyId: number): Promise<void> {
    return this.remove('25519-preKey-' + keyId);
  }
  removeSignedPreKey(keyId: number): Promise<void> {
    return this.remove('25519-signed-preKey-' + keyId);
  }
  storePreKey(keyId: number, keyPair: any): Promise<void> {
    return this.put('25519-preKey-' + keyId, keyPair);
  }
  storeSession(identifier: string, record: string): Promise<void> {
    return this.put('session-' + identifier, record);
  }
  storeSignedPreKey(keyId: number, keyPair: any): Promise<void> {
    return this.put('25519-signed-preKey-' + keyId, keyPair);
  }
  async saveIdentity(identifier: string, identityKey: ArrayBuffer): Promise<boolean> {
    const existing = await this.get('identityKey-' + identifier, undefined);
    if (existing && existing.pubKey.toString() !== identityKey.toString()) {
        return false;
    }
    await this.put('identityKey-' + identifier, identityKey);
    return true;
  }
  async loadIdentityKey(identifier: string): Promise<ArrayBuffer | undefined> {
    return await this.get('identityKey-' + identifier, undefined);
  }
}

// Global store instance for simplicity
let store: SignalProtocolStoreImpl;
function getStore(): SignalProtocolStoreImpl {
    if (!store) {
        if (typeof window !== 'undefined') {
            store = new SignalProtocolStoreImpl();
        } else {
            // This is a server-side render, return a dummy store
            return {
                get: () => Promise.resolve(undefined),
                put: () => Promise.resolve(),
            } as any;
        }
    }
    return store;
}

export async function generateSignalKeys(userId: string) {
  const store = getStore();
  const registrationId = KeyHelper.generateRegistrationId();
  await store.put('registrationId', registrationId);

  const identityKeyPair = await KeyHelper.generateIdentityKeyPair();
  await store.put('identityKey', identityKeyPair);

  const preKey = await KeyHelper.generatePreKey(registrationId + 1);
  await store.storePreKey(preKey.keyId, preKey.keyPair);

  const signedPreKey = await KeyHelper.generateSignedPreKey(identityKeyPair, registrationId + 1);
  await store.storeSignedPreKey(signedPreKey.keyId, signedPreKey.keyPair);

  const publicSignedPreKey = {
      keyId: signedPreKey.keyId,
      publicKey: signedPreKey.keyPair.pubKey,
      signature: signedPreKey.signature,
  };

  // This is the public bundle that will be stored on the server
  const serializedPreKeyBundle = {
    registrationId,
    identityKey: identityKeyPair.pubKey,
    signedPreKey: publicSignedPreKey,
    preKey: {
        keyId: preKey.keyId,
        publicKey: preKey.keyPair.pubKey,
    },
  };

  return { serializedPreKeyBundle };
}

async function getSessionCipher(recipientId: string, preKeyBundle: any): Promise<SessionCipher> {
    const store = getStore();
    const address = new SignalProtocolAddress(recipientId, 1); // Device ID is 1 for simplicity
    
    // Check if a session already exists
    const session = await store.loadSession(address.toString());
    if (!session) {
      const sessionBuilder = new SessionBuilder(store, address);
      await sessionBuilder.processPreKey(preKeyBundle);
    }
    
    return new SessionCipher(store, address);
}

// Helper to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

export async function encryptMessage(recipientId: string, recipientPreKeyBundle: any, message: string): Promise<string> {
    const cipher = await getSessionCipher(recipientId, recipientPreKeyBundle);
    const messageBuffer = new TextEncoder().encode(message);
    const ciphertext = await cipher.encrypt(messageBuffer);

    // We'll store the type and the body (which is an ArrayBuffer)
    // The body needs to be converted to something that can be JSON.stringified, like Base64
    const storableCiphertext = {
        type: ciphertext.type,
        body: arrayBufferToBase64(ciphertext.body),
    };

    return JSON.stringify(storableCiphertext);
}


export async function decryptMessage(senderId: string, ciphertext: string): Promise<string> {
    const store = getStore();
    const address = new SignalProtocolAddress(senderId, 1);
    const cipher = new SessionCipher(store, address);
    
    const parsedCiphertext = JSON.parse(ciphertext);
    const bodyBuffer = base64ToArrayBuffer(parsedCiphertext.body);
    
    let plaintextBuffer;

    if (parsedCiphertext.type === 3) { // PreKeyWhisperMessage
        plaintextBuffer = await cipher.decryptPreKeyWhisperMessage(bodyBuffer);
    } else { // WhisperMessage
        plaintextBuffer = await cipher.decryptWhisperMessage(bodyBuffer);
    }
    return new TextDecoder().decode(new Uint8Array(plaintextBuffer));
}


// Utility to rehydrate ArrayBuffers from serialized JSON data
export function rehydratePreKeyBundle(bundle: any): PreKeyBundle {
    return {
        ...bundle,
        identityKey: Buffer.from(Object.values(bundle.identityKey)),
        preKey: {
            ...bundle.preKey,
            publicKey: Buffer.from(Object.values(bundle.preKey.publicKey)),
        },
        signedPreKey: {
            ...bundle.signedPreKey,
            publicKey: Buffer.from(Object.values(bundle.signedPreKey.publicKey)),
            signature: Buffer.from(Object.values(bundle.signedPreKey.signature)),
        }
    };
}
