import { expect } from 'chai'
import { KeyPair, Signer, VerificationResult, Verifier } from '../src'

// Because KeyPair is an abstract class, we'll be testing an example subclass
class ExampleKeyPair extends KeyPair {
  fingerprint(): string {
    return 'mock fingerprint'
  }

  verifyFingerprint({
    fingerprint
  }: {
    fingerprint: string
  }): VerificationResult {
    return { verified: false }
  }

  signer(): Signer {
    return {
      async sign({ data }: { data: Uint8Array }): Promise<Uint8Array> {
        return new Uint8Array()
      }
    }
  }

  verifier(): Verifier {
    return {
      async verify({
        data,
        signature
      }: {
        data: Uint8Array
        signature: Uint8Array
      }): Promise<boolean> {
        return false
      }
    }
  }
}

describe('KeyPair', () => {
  describe('constructor', () => {
    it('should initialize id and controller', async () => {
      const controller = 'did:ex:1234'
      const id = 'did:ex:1234#fingerprint'
      const keyPair = new ExampleKeyPair({ id, controller })

      expect(keyPair.id).to.equal(id)
      expect(keyPair.controller).to.equal(controller)
    })
  })

  describe('generate()', () => {
    it('should throw an abstract method error', async () => {
      let error

      try {
        await ExampleKeyPair.generate()
      } catch (e: any) {
        error = e
      }
      expect(error.message).to.match(/Abstract method/)
    })
  })

  describe('from()', () => {
    it('should throw an abstract method error', async () => {
      let error

      try {
        await ExampleKeyPair.from()
      } catch (e: any) {
        error = e
      }
      expect(error.message).to.match(/Abstract method/)
    })
  })

  describe('export()', () => {
    it('should error if neither private or public key specified', async () => {
      const keyPair = new ExampleKeyPair()
      expect(() => {
        keyPair.export()
      }).to.throw(/Export requires/)
    })
  })

  describe('fromKeyDocument()', async () => {
    const EXAMPLE_KEY_DOCUMENT = {
      id: 'did:example:1234#z6MkszZtxCmA2Ce4vUV132PCuLQmwnaDD5mw2L23fGNnsiX3',
      controller: 'did:example:1234',
      type: 'Ed25519VerificationKey2020',
      publicKeyMultibase: 'zEYJrMxWigf9boyeJMTRN4Ern8DJMoCXaLK77pzQmxVjf'
    }

    it('should invoke the suite from() method', async () => {
      const keyDocument = { ...EXAMPLE_KEY_DOCUMENT }
      let error
      try {
        await ExampleKeyPair.fromKeyDocument({
          document: keyDocument,
          checkContext: false,
          checkRevoked: false
        })
      } catch (e: any) {
        error = e
      }
      expect(error).to.exist
      expect(error.message).to.equal(
        'Abstract method from() must be implemented in subclass.'
      )
    })

    it('should error on failed context check', async () => {
      const keyDocument = { ...EXAMPLE_KEY_DOCUMENT }
      let error
      try {
        await ExampleKeyPair.fromKeyDocument({
          document: keyDocument,
          checkContext: true
        })
      } catch (e: any) {
        error = e
      }
      expect(error).to.exist

      expect(error.message)
        .to // eslint-disable-next-line max-len
        .equal(
          'Key document does not contain required context "INVALID KeyPair CONTEXT".'
        )
    })

    it('should error on failed revoked check', async () => {
      const pastDate = new Date(2020, 11, 17)
        .toISOString()
        .replace(/\.[0-9]{3}/, '')
      const keyDocument = {
        ...EXAMPLE_KEY_DOCUMENT,
        revoked: pastDate
      }
      let error
      try {
        await ExampleKeyPair.fromKeyDocument({
          document: keyDocument,
          checkContext: false,
          checkRevoked: true
        })
      } catch (e: any) {
        error = e
      }
      expect(error).to.exist
      expect(error.message).to.contain('revoked')
      expect(error.message).to.contain(pastDate)
    })
  })
})
