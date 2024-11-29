import {
  Failure as FailureEvent,
  NewAdmin as NewAdminEvent,
  NewImplementation as NewImplementationEvent,
  NewPendingAdmin as NewPendingAdminEvent,
  NewPendingImplementation as NewPendingImplementationEvent
} from "../generated/Unitroller/Unitroller"
import {
  Failure,
  NewAdmin,
  NewImplementation,
  NewPendingAdmin,
  NewPendingImplementation
} from "../generated/schema"

export function handleFailure(event: FailureEvent): void {
  let entity = new Failure(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.error = event.params.error
  entity.info = event.params.info
  entity.detail = event.params.detail

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNewAdmin(event: NewAdminEvent): void {
  let entity = new NewAdmin(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldAdmin = event.params.oldAdmin
  entity.newAdmin = event.params.newAdmin

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNewImplementation(event: NewImplementationEvent): void {
  let entity = new NewImplementation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldImplementation = event.params.oldImplementation
  entity.newImplementation = event.params.newImplementation

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNewPendingAdmin(event: NewPendingAdminEvent): void {
  let entity = new NewPendingAdmin(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldPendingAdmin = event.params.oldPendingAdmin
  entity.newPendingAdmin = event.params.newPendingAdmin

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNewPendingImplementation(
  event: NewPendingImplementationEvent
): void {
  let entity = new NewPendingImplementation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldPendingImplementation = event.params.oldPendingImplementation
  entity.newPendingImplementation = event.params.newPendingImplementation

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
