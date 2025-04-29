# keypair Changelog

## 2.0.0 -
### Changed
- **BREAKING**: Refactored to use [`@digitalcredentials/ssi`](https://github.com/digitalcredentials/ssi)
  types.

## 1.0.5 - 2022-12-22
### Changed
- Adjust export compile target.
- Re-export GenerateKeyPairOptions

## 1.0.3 - 2022-12-20
### Added
- Export `SerializedKeyPair` interface.

## 1.0.2 - 2022-12-19
### Changed
- Fix constructor signature.
- Fix type declarations in dist/.

## 1.0.0 - 2022-12-19
### Added
- Initial commit. Extracted the `LDKeyPair` class from [`crypto-ld v7.0`](https://github.com/digitalbazaar/crypto-ld),
  converted it to Typescript, and renamed to `KeyPair`.
- For previous changes, see the `crypto-ld` CHANGELOG
