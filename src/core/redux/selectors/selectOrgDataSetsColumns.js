/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { EDM, ORG_DATA_SET_COLUMNS } from '~/common/constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrgDataSetsColumns(organizationId :UUID, dataSetIds ?:UUID[]) {

  return (state :Map) :Map<UUID, Map> => {

    if (isValidUUID(organizationId)) {
      if (dataSetIds) {
        return Map().withMutations((mutableMap :Map<UUID, Map>) => {
          dataSetIds.forEach((dataSetId :UUID) => {
            if (isValidUUID(dataSetId)) {
              const dataSetColumns = getIn(state, [EDM, ORG_DATA_SET_COLUMNS, organizationId, dataSetId]) || Map();
              mutableMap.set(dataSetId, dataSetColumns);
            }
          });
        });
      }
      return getIn(state, [EDM, ORG_DATA_SET_COLUMNS, organizationId]) || Map();
    }

    return Map();
  };
}
