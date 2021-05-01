import { EMPTY_ADDRESS, ROOT_NODE } from './utils'

import { Domain } from '../generated/schema'

export function createDomain(id: string): Domain {
  let domain = new Domain(id)

  if(id == ROOT_NODE) {

    domain.owner = EMPTY_ADDRESS
    domain.label = ''
    domain.fqn = ''

    domain.save()
  }

  return domain
}

export function getDomain(id: string): Domain|null {
  let domain = Domain.load(id)
  if(domain == null) { return createDomain(id) }
  return domain
}
