/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { DataSetMetadataApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ERROR,
  ID,
  ORGANIZATION_ID,
  ORG_DATA_SETS,
  REQUEST_STATE,
} from '~/common/constants';

const { GET_DATA_SETS_METADATA, getDataSetsMetadata } = DataSetMetadataApiActions;

export default function reducer(state :Map, action :SequenceAction) {

  return getDataSetsMetadata.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_DATA_SETS_METADATA, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_DATA_SETS_METADATA, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GET_DATA_SETS_METADATA, action.id])) {
        let newState = state;
        fromJS(action.value).forEach((dataSet :Map) => {
          const dataSetId :UUID = dataSet.get(ID);
          const organizationId :UUID = dataSet.get(ORGANIZATION_ID);
          newState = newState.setIn([ORG_DATA_SETS, organizationId, dataSetId], dataSet);
        });
        return newState.setIn([GET_DATA_SETS_METADATA, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_DATA_SETS_METADATA, action.id])) {
        return state
          .setIn([GET_DATA_SETS_METADATA, ERROR], action.value)
          .setIn([GET_DATA_SETS_METADATA, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_DATA_SETS_METADATA, action.id]),
  });
}
