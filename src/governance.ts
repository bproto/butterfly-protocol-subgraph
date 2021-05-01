import { BigInt } from '@graphprotocol/graph-ts'

import { Transfer as TransferEvent } from '../generated/GovernanceToken/GovernanceToken'
import {
  Sponsored as SponsorshipEvent,
  Bid as BidEvent,
  Claimed as ClaimEvent
} from '../generated/Governance/Governance'

import { Auction, Tranche, Bid, Position } from '../generated/schema'

import { EMPTY_ADDRESS, Days } from './utils'
import { getAccount, ensureAccount} from './account'

let Zero = BigInt.fromI32(0)
let OneSecond = BigInt.fromI32(1)
let TwoDays = BigInt.fromI32(2 * Days)
let TenDays = BigInt.fromI32(10 * Days)

function createTranche(auction: string, position: BigInt, start: BigInt): Tranche {
  let id = auction + '-' + position.toString()
  let tranche = new Tranche(id)

  tranche.auction = auction
  tranche.start = start.plus(TwoDays.times(position))
  tranche.end = tranche.start.plus(TwoDays).minus(OneSecond)
  tranche.raised = Zero

  tranche.save()

  return tranche
}

export function handleTransfer(event: TransferEvent): void {
  let from = event.params.from.toHex()
  let to = event.params.to.toHex()
  let value = event.params.value

  let source = getAccount(from)
  let destination = getAccount(to)

  if (from != EMPTY_ADDRESS) {
    source.balance = source.balance.minus(value)
  }

  if (to != EMPTY_ADDRESS) {
    destination.balance = destination.balance.plus(value)
  }

  source.save()
  destination.save()
}

// event Sponsored(bytes32 indexed namehash, uint256 started, address sponsor, uint256 checkpoint);
export function handleSponsorship(event: SponsorshipEvent): void {
  let auction = new Auction(event.params.namehash.toHex())

  auction.created = event.block.timestamp
  auction.start = event.params.started
  auction.end = auction.start.plus(TenDays)

  auction.domain = event.params.namehash.toHex()
  auction.sponsor = event.params.sponsor.toHex()
  auction.checkpoint = event.params.checkpoint

  auction.save()

  createTranche(auction.id, BigInt.fromI32(0), auction.start)
  createTranche(auction.id, BigInt.fromI32(1), auction.start)
  createTranche(auction.id, BigInt.fromI32(2), auction.start)
  createTranche(auction.id, BigInt.fromI32(3), auction.start)
  createTranche(auction.id, BigInt.fromI32(4), auction.start)
}

// event Bid(bytes32 indexed namehash, uint256 tranche, address account, uint256 amount);
export function handleBid(event: BidEvent): void {
  let tranche = Tranche.load(event.params.namehash.toHex() + '-' + event.params.tranche.toString())
  let account = ensureAccount(event.params.account.toHex())
  let amount = event.params.amount
  let positionId = tranche.id + '-' + event.params.account.toHex()

  let bid = new Bid(event.transaction.hash.toHexString() + '-' + event.transactionLogIndex.toString())

  bid.placed = event.block.timestamp
  bid.amount = amount
  bid.bidder = account.id
  bid.tranche = tranche.id
  bid.position = positionId
  bid.save()

  let position = Position.load(positionId)

  if (position == null) {
    position = new Position(positionId)
    position.account = account.id
    position.tranche = tranche.id
    position.amount = Zero
  }

  position.amount = position.amount.plus(amount)
  position.save()

  tranche.raised = tranche.raised.plus(amount)
  tranche.save()
}

// event Claimed(bytes32 indexed namehash, address account, uint256 amount);
export function handleClaim(event: ClaimEvent): void {}
