import { BigInt } from '@graphprotocol/graph-ts'

import { Account } from '../generated/schema'

export function createAccount(id: string): Account {
  let account = new Account(id)
  account.balance = BigInt.fromI32(0)
  return account
}

export function getAccount(id: string): Account|null {
  let account = Account.load(id)
  if(account == null) { return createAccount(id) }
  return account
}

export function ensureAccount(id: string): Account|null {
  let account = getAccount(id)
  account.save()
  return account
}
