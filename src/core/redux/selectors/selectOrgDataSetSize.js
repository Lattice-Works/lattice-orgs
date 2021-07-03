/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { EDM, ENTITY_SET_SIZE_MAP } from '~/common/constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrgDataSetSize(organizationId :UUID, dataSetId :UUID) {

  return (state :Map) :?number => {

    if (isValidUUID(organizationId) && isValidUUID(dataSetId)) {
      return getIn(state, [EDM, ENTITY_SET_SIZE_MAP, organizationId, dataSetId]) || undefined;
    }

    return undefined;
  };
}
