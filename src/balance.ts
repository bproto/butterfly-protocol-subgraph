import { BigInt } from '@graphprotocol/graph-ts'
import { Balance } from '../generated/schema'
import { ensureAccount } from './account'

export function createBalance(account: string, token: string): Balance {
  let id = account + '-' + token
  let balance = new Balance(id)

  ensureAccount(account)
  balance.account = account

  balance.token = token
  balance.amount = BigInt.fromI32(0)

  return balance
}

export function getBalance(account: string, token: string): Balance|null {
  let id = account + '-' + token
  let balance = Balance.load(id)
  if(balance == null) { return createBalance(account, token) }
  return balance
}

export function ensureBalance(account: string, token: string): Balance|null {
  let balance = getBalance(account, token)
  balance.save()
  return balance
}
