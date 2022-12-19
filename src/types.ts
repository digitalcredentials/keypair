/*!
 * Copyright (c) 2022 Digital Credentials Consortium.
 */
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
