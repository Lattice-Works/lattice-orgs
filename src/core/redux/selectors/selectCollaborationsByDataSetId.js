/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { COLLABORATIONS, COLLABORATIONS_BY_DATA_SET_ID } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectCollaborationsByDataSetId(dataSetId :UUID) {

  return (state :Map) :List<UUID> => {

    if (isValidUUID(dataSetId)) {
      return getIn(state, [COLLABORATIONS, COLLABORATIONS_BY_DATA_SET_ID, dataSetId]) || List();
    }

    return List();
  };
}
