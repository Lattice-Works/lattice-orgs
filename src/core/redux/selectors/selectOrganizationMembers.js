/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { MEMBERS, ORGANIZATIONS } from '~/common/constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrganizationMembers(organizationId :?UUID) {

  return (state :Map) :List => {

    if (isValidUUID(organizationId)) {
      return getIn(state, [ORGANIZATIONS, MEMBERS, organizationId]) || List();
    }

    return List();
  };
}
