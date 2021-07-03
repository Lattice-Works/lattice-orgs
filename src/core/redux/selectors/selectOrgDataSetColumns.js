/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { EDM, ORG_DATA_SET_COLUMNS } from '~/common/constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrgDataSetColumns(organizationId :UUID, dataSetId :UUID) {

  return (state :Map) :Map<UUID, Map> => {

    if (isValidUUID(organizationId) && isValidUUID(dataSetId)) {
      return getIn(state, [EDM, ORG_DATA_SET_COLUMNS, organizationId, dataSetId]) || Map();
    }

    return Map();
  };
}
