/*!
 * Copyright (c) 2022 Digital Credentials Consortium.
 */
export interface SerializedKeyPair {
  '@context'?: string
  id?: string
  type?: string
  controller?: string
  revoked?: string

  /**
   * Public / private key material
   */
  // Used by Ed25519VerificationKey2018 and others
  publicKeyBase58?: string
  privateKeyBase58?: string

  // Used by Ed25519VerificationKey2020
  publicKeyMultibase?: string
  privateKeyMultibase?: string

  // Used by JsonWebKey2020
  publicKeyJwk?: PublicKeyJwk
  privateKeyJwk?: PrivateKeyJwk
}

export type GenerateKeyPairOptions = SerializedKeyPair & {
  seed?: Uint8Array
}

export interface JsonWebKey {
  crv?: string | undefined;
  d?: string | undefined;
  dp?: string | undefined;
  dq?: string | undefined;
  e?: string | undefined;
  k?: string | undefined;
  kty?: string | undefined;
  n?: string | undefined;
  p?: string | undefined;
  q?: string | undefined;
  qi?: string | undefined;
  x?: string | undefined;
  y?: string | undefined;
  [key: string]: unknown;
}

export interface PublicKeyJwk {
  // Key type, e.g. 'RSA' or 'OKP'
  kty: string
  // Used by elliptic cryptography keys (kty: 'OKP'), e.g. 'Ed25519'
  crv?: string
  // Public key, typically base64url encoded
  x?: string
}

export interface PrivateKeyJwk {
  // Key type, e.g. 'RSA' or 'OKP'
  kty: string
  // Used by elliptic cryptography keys (kty: 'OKP'), e.g. 'Ed25519'
  crv?: string
  // Public key, typically base64url encoded
  x?: string
  // Private key, typically base64url encoded
  d?: string
}

export interface Signer {
  id?: string
  algorithm?: string
  sign: ({ data }: { data: Uint8Array }) => Promise<Uint8Array>
}

export interface Verifier {
  id?: string
  verify: ({
    data,
    signature
  }: {
    data: Uint8Array
    signature: Uint8Array
  }) => Promise<boolean>
}

export interface VerificationResult {
  verified: boolean
  error?: Error | any
}
