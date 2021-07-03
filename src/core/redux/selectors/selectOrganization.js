/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { Organization, UUID } from 'lattice';

import { ORGANIZATIONS } from '~/common/constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrganization(organizationId :UUID) {

  return (state :Map) :?Organization => {

    if (isValidUUID(organizationId)) {
      return getIn(state, [ORGANIZATIONS, ORGANIZATIONS, organizationId]);
    }

    return undefined;
  };
}
