/*!
 * Copyright (c) 2022-2025 Digital Credentials Consortium. (Conversion to Typescript)
 * Copyright (c) 2018-2022 Digital Bazaar, Inc. All rights reserved.
 */
import { IKeyPair, IKeyPairCore, ISigner, IVerifier } from '@digitalcredentials/ssi'

export interface IVerificationResult {
  verified: boolean
  error?: Error
}

export abstract class KeyPair implements IKeyPairCore {
  id?: string
  type?: string
  controller?: string
  revoked?: string

  // Implementers must override this in subclasses
  static SUITE_CONTEXT: string = 'INVALID KeyPair CONTEXT'

  /**
   * Creates a public/private key pair instance. This is an abstract base class,
   * actual key material and suite-specific methods are handled in the subclass.
   *
   * To generate or import a key pair, use the `cryptoLd` instance.
   *
   * @see CryptoLD.js
   *
   * @param {object} options - The options to use.
   * @param {string} options.id - The key id, typically composed of controller
   *   URL and key fingerprint as hash fragment.
   * @param {string} options.controller - DID/URL of the person/entity
   *   controlling this key.
   * @param {string} [options.revoked] - Timestamp of when the key has been
   *   revoked, in RFC3339 format. If not present, the key itself is
   *   considered not revoked. (Note that this mechanism is slightly different
   *   from DID Document key revocation, where a DID controller can revoke a
   *   key from that DID by removing it from the DID Document.)
   */
  constructor ({ id, controller, revoked }: IKeyPairCore = {}) {
    this.id = id
    this.type = '' // type must be set by subclasses
    this.controller = controller
    this.revoked = revoked
  }

  /**
   * Generates a new public/private key pair instance.
   * Note that this method is not typically called directly by client code,
   * but instead is used through a `cryptoLd` instance.
   *
   * @param {object} options - Suite-specific options for the KeyPair. For
   *   common options, see the `LDKeyPair.constructor()` docstring.
   *
   * @returns {Promise<KeyPair>} An LDKeyPair instance.
   */
  static async generate (options: IKeyPair = {}): Promise<KeyPair> {
    throw new Error('Abstract method, must be implemented in subclass.')
  }

  /**
   * Imports a key pair instance from a provided externally fetched key
   * document (fetched via a secure JSON-LD `documentLoader` or via
   * `cryptoLd.fromKeyId()`), optionally checking it for revocation and required
   * context.
   *
   * @param {object} options - Options hashmap.
   * @param {string} options.document - Externally fetched key document.
   * @param {boolean} [options.checkContext=true] - Whether to check that the
   *   fetched key document contains the context required by the key's crypto
   *   suite.
   * @param {boolean} [options.checkRevoked=true] - Whether to check the key
   *   object for the presence of the `revoked` timestamp.
   *
   * @returns {Promise<KeyPair>} Resolves with the resulting key pair
   *   instance.
   */
  static async fromKeyDocument ({
    document,
    checkContext = true,
    checkRevoked = true
  }: {
    document: IKeyPairCore
    checkContext?: boolean
    checkRevoked?: boolean
  }): Promise<KeyPair> {
    if (checkContext) {
      const fetchedDocContexts: string[] = Array.isArray(document['@context'])
        ? document['@context']
        : [document['@context'] as string]

      if (!fetchedDocContexts.includes(this.SUITE_CONTEXT)) {
        throw new Error(
          'Key document does not contain required context "' +
            this.SUITE_CONTEXT +
            '".'
        )
      }
    }
    if (checkRevoked && ((document.revoked ?? '') !== '')) {
      throw new Error(`Key has been revoked since: "${document.revoked ?? ''}".`)
    }
    return await this.from(document)
  }

  /**
   * Generates a KeyPair from some options.
   *
   * @param {object} options  - Will generate a key pair in multiple different
   *   formats.
   * @example
   * > const options = {
   *    type: 'Ed25519VerificationKey2020'
   *   };
   * > const edKeyPair = await LDKeyPair.from(options);
   *
   * @returns {Promise<KeyPair>} A LDKeyPair.
   * @throws Unsupported Key Type.
   */
  static async from (options: IKeyPairCore): Promise<KeyPair> {
    throw new Error('Abstract method from() must be implemented in subclass.')
  }

  /**
   * Exports the serialized representation of the KeyPair
   * and other information that json-ld Signatures can use to form a proof.
   *
   * NOTE: Subclasses MUST override this method (and add the exporting of
   * their public and private key material).
   *
   * @param {object} [options={}] - Options hashmap.
   * @param {boolean} [options.publicKey] - Export public key material?
   * @param {boolean} [options.privateKey] - Export private key material?
   *
   * @returns {object} A public key object
   *   information used in verification methods by signatures.
   */
  export ({
    publicKey = false,
    privateKey = false,
    includeContext = false
  }: {
    publicKey?: boolean
    privateKey?: boolean
    includeContext?: boolean
  } = {}): IKeyPair {
    if (!publicKey && !privateKey) {
      throw new Error(
        'Export requires specifying either "publicKey" or "privateKey".'
      )
    }
    const key: IKeyPair = {
      id: this.id,
      type: this.type,
      controller: this.controller
    }
    if (this.revoked != null) {
      key.revoked = this.revoked
    }

    return key
  }

  /**
   * Returns the public key fingerprint, multibase+multicodec encoded. The
   * specific fingerprint method is determined by the key suite, and is often
   * either a hash of the public key material (such as with RSA), or the
   * full encoded public key (for key types with sufficiently short
   * representations, such as ed25519).
   * This is frequently used in initializing the key id, or generating some
   * types of cryptonym DIDs.
   *
   * @returns {string} The fingerprint.
   */
  abstract fingerprint (): string

  /**
   * Verifies that a given key fingerprint matches the public key material
   * belonging to this key pair.
   *
   * @param {string} fingerprint - Public key fingerprint.
   *
   * @returns {{verified: boolean}} An object with verified flag.
   */
  abstract verifyFingerprint ({
    fingerprint
  }: {
    fingerprint: string
  }): IVerificationResult

  /**
   * Returns a signer object for use with
   * [jsonld-signatures]{@link https://github.com/digitalbazaar/jsonld-signatures}.
   * NOTE: Applies only to verifier type keys (like ed25519).
   *
   * @example
   * > const signer = keyPair.signer();
   * > signer
   * { sign: [AsyncFunction: sign] }
   * > signer.sign({data});
   *
   * @returns {{sign: Function}} A signer for json-ld usage.
   */
  abstract signer (): ISigner

  /**
   * Returns a verifier object for use with
   * [jsonld-signatures]{@link https://github.com/digitalbazaar/jsonld-signatures}.
   * NOTE: Applies only to verifier type keys (like ed25519).
   *
   * @example
   * > const verifier = keyPair.verifier();
   * > verifier
   * { verify: [AsyncFunction: verify] }
   * > verifier.verify(key);
   *
   * @returns {{verify: Function}} Used to verify jsonld-signatures.
   */
  abstract verifier (): IVerifier
}
