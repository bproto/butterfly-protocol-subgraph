import { Transfer as TransferEvent } from '../generated/templates/DomainToken/DomainToken'

// import { Account, DomainToken } from '../generated/schema'

import { EMPTY_ADDRESS } from './utils'
import { getBalance } from './balance'

export function handleTransfer(event: TransferEvent): void {
  let token = event.address.toHex()
  let from = event.params.from.toHex()
  let to = event.params.to.toHex()
  let value = event.params.value

  let source = getBalance(from, token)
  let destination = getBalance(to, token)

  if (from != EMPTY_ADDRESS) {
    source.amount = source.amount.minus(value)
  }

  if (to != EMPTY_ADDRESS) {
    destination.amount = destination.amount.plus(value)
  }

  source.save()
  destination.save()
}
