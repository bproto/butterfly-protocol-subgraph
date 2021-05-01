import { store, ByteArray } from '@graphprotocol/graph-ts'

import { Transfer } from '../generated/RegistryToken/RegistryToken'
import { Domain, Token, Attribute } from '../generated/schema'
import { DomainToken } from '../generated/templates'
import { DomainRegistered, EconomyRegistered, AttrSet } from '../generated/Registry/Registry'

import { cidFrom } from './utils'
import { EMPTY_ADDRESS, RECORD_SLOT } from './utils'
import { namehash as nh, uint256ToByteArray } from './utils'

import { ensureAccount } from './account'
import { getDomain } from './domain'

// That first contract didn't go so well
const BadToken = '0x3b0d4e4b6c8ba06e310ac7c9839a94aec4b7969d'

export function handleTransfer(event: Transfer): void {
  let namehash = uint256ToByteArray(event.params.tokenId).toHex()
  let domain = getDomain(namehash)
  let account = ensureAccount(event.params.to.toHex())

  domain.owner = account.id
  domain.save()
}

export function handleDomainRegistered(event: DomainRegistered): void {
  let parent = getDomain(event.params.parent.toHex())

  let label = event.params.label
  let namehash = nh(label, ByteArray.fromHexString(parent.id)).toHex()
  let domain = new Domain(namehash)

  domain.owner = EMPTY_ADDRESS
  domain.parent = parent.id
  domain.label = label
  domain.fqn = parent.fqn != '' ? label + '.' + parent.fqn : label

  domain.save()
}

export function handleEconomyRegistered(event: EconomyRegistered): void {
  let address = event.params.tokenContract
  let namehash = event.params.namehash

  let token = new Token(address.toHex())
  token.domain = namehash.toHex()
  token.save()

  let domain = getDomain(namehash.toHex())
  if (domain.token != null) { store.remove('Token', domain.token) }

  domain.token = token.id
  domain.save()

  if ( address.toHex() != BadToken ) { DomainToken.create(address) }
}

export function handleAttrSet(event: AttrSet): void {
  let namehash = event.params.namehash.toHex()
  let key = event.params.key
  let value = event.params.value

  if (key.toHex() == RECORD_SLOT) {
    let domain = new Domain(namehash)
    domain.cid = cidFrom(value).toBase58()
    domain.save()
  }

  let attr = new Attribute(namehash + '-' + key.toHex())

  attr.key = key
  attr.value = value
  attr.domain = namehash

  attr.save()
}
