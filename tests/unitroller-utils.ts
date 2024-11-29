import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  Failure,
  NewAdmin,
  NewImplementation,
  NewPendingAdmin,
  NewPendingImplementation
} from "../generated/Unitroller/Unitroller"

export function createFailureEvent(
  error: BigInt,
  info: BigInt,
  detail: BigInt
): Failure {
  let failureEvent = changetype<Failure>(newMockEvent())

  failureEvent.parameters = new Array()

  failureEvent.parameters.push(
    new ethereum.EventParam("error", ethereum.Value.fromUnsignedBigInt(error))
  )
  failureEvent.parameters.push(
    new ethereum.EventParam("info", ethereum.Value.fromUnsignedBigInt(info))
  )
  failureEvent.parameters.push(
    new ethereum.EventParam("detail", ethereum.Value.fromUnsignedBigInt(detail))
  )

  return failureEvent
}

export function createNewAdminEvent(
  oldAdmin: Address,
  newAdmin: Address
): NewAdmin {
  let newAdminEvent = changetype<NewAdmin>(newMockEvent())

  newAdminEvent.parameters = new Array()

  newAdminEvent.parameters.push(
    new ethereum.EventParam("oldAdmin", ethereum.Value.fromAddress(oldAdmin))
  )
  newAdminEvent.parameters.push(
    new ethereum.EventParam("newAdmin", ethereum.Value.fromAddress(newAdmin))
  )

  return newAdminEvent
}

export function createNewImplementationEvent(
  oldImplementation: Address,
  newImplementation: Address
): NewImplementation {
  let newImplementationEvent = changetype<NewImplementation>(newMockEvent())

  newImplementationEvent.parameters = new Array()

  newImplementationEvent.parameters.push(
    new ethereum.EventParam(
      "oldImplementation",
      ethereum.Value.fromAddress(oldImplementation)
    )
  )
  newImplementationEvent.parameters.push(
    new ethereum.EventParam(
      "newImplementation",
      ethereum.Value.fromAddress(newImplementation)
    )
  )

  return newImplementationEvent
}

export function createNewPendingAdminEvent(
  oldPendingAdmin: Address,
  newPendingAdmin: Address
): NewPendingAdmin {
  let newPendingAdminEvent = changetype<NewPendingAdmin>(newMockEvent())

  newPendingAdminEvent.parameters = new Array()

  newPendingAdminEvent.parameters.push(
    new ethereum.EventParam(
      "oldPendingAdmin",
      ethereum.Value.fromAddress(oldPendingAdmin)
    )
  )
  newPendingAdminEvent.parameters.push(
    new ethereum.EventParam(
      "newPendingAdmin",
      ethereum.Value.fromAddress(newPendingAdmin)
    )
  )

  return newPendingAdminEvent
}

export function createNewPendingImplementationEvent(
  oldPendingImplementation: Address,
  newPendingImplementation: Address
): NewPendingImplementation {
  let newPendingImplementationEvent = changetype<NewPendingImplementation>(
    newMockEvent()
  )

  newPendingImplementationEvent.parameters = new Array()

  newPendingImplementationEvent.parameters.push(
    new ethereum.EventParam(
      "oldPendingImplementation",
      ethereum.Value.fromAddress(oldPendingImplementation)
    )
  )
  newPendingImplementationEvent.parameters.push(
    new ethereum.EventParam(
      "newPendingImplementation",
      ethereum.Value.fromAddress(newPendingImplementation)
    )
  )

  return newPendingImplementationEvent
}
