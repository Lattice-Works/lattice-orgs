/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { EDM, ORG_DATA_SETS } from '~/common/constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrgDataSets(organizationId :UUID, dataSetIds ?:UUID[]) {

  return (state :Map) :Map<UUID, Map> => {

    if (isValidUUID(organizationId)) {
      if (dataSetIds) {
        return Map().withMutations((mutableMap :Map<UUID, Map>) => {
          dataSetIds.forEach((dataSetId :UUID) => {
            const dataSet = getIn(state, [EDM, ORG_DATA_SETS, organizationId, dataSetId]) || Map();
            mutableMap.set(dataSetId, dataSet);
          });
        });
      }
      return getIn(state, [EDM, ORG_DATA_SETS, organizationId]) || Map();
    }

    return Map();
  };
}
