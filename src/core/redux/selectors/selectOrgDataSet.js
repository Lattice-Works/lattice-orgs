/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { EDM, ORG_DATA_SETS } from '~/common/constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrgDataSet(organizationId :UUID, dataSetId :UUID) {

  return (state :Map) :Map => {

    if (isValidUUID(organizationId) && isValidUUID(dataSetId)) {
      return getIn(state, [EDM, ORG_DATA_SETS, organizationId, dataSetId]) || Map();
    }

    return Map();
  };
}
