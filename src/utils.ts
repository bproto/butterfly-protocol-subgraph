import { BigInt, ByteArray } from '@graphprotocol/graph-ts'
import { crypto } from '@graphprotocol/graph-ts'

export const EMPTY_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'
export const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'
export const CID_PREFIX = '0x1220'
export const ROOT_NODE = EMPTY_HASH
export const RECORD_SLOT = EMPTY_HASH

export const Seconds = 1
export const Minutes = 60 * Seconds
export const Hours = 60 * Minutes
export const Days = 24 * Hours

export const Day = Days


// Helper for concatenating two byte arrays
export function concat(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length)
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i]
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j]
  }
  return out as ByteArray
}

export function uint256ToByteArray(i: BigInt): ByteArray {
  let hex = i.toHex().slice(2).padStart(64, '0')
  return ByteArray.fromHexString(hex)
}

export function namehash(fqn: String, root: ByteArray = ByteArray.fromHexString(ROOT_NODE)): ByteArray {
  return crypto.keccak256(concat(root, crypto.keccak256(ByteArray.fromUTF8(fqn))))
}

export function cidFrom(hash: ByteArray): ByteArray {
  return concat(ByteArray.fromHexString(CID_PREFIX), hash)
}
