/*
 * @flow
 */

import { Map, Set, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { ENTITY_SET_IDS, ORGANIZATIONS } from '~/common/constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrganizationEntitySetIds(organizationId :?UUID) {

  return (state :Map) :Set<UUID> => {

    if (isValidUUID(organizationId)) {
      return getIn(state, [ORGANIZATIONS, ENTITY_SET_IDS, organizationId]) || Set();
    }

    return Set();
  };
}
