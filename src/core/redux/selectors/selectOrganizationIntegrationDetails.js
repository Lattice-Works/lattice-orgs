/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { INTEGRATION_DETAILS, ORGANIZATIONS } from '~/common/constants';

const { isValidUUID } = ValidationUtils;

const EMPTY_MAP = Map();

export default function selectOrganizationIntegrationDetails(organizationId :?UUID) {

  return (state :Map) :Map => {

    if (isValidUUID(organizationId)) {
      return getIn(state, [ORGANIZATIONS, INTEGRATION_DETAILS, organizationId]) || Map();
    }

    return EMPTY_MAP;
  };
}
