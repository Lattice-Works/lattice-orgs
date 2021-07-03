/*
 * @flow
 */

import { Map } from 'immutable';
import { DataSetsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { DATA_SET_SCHEMA, REQUEST_STATE } from '~/common/constants';

const { GET_ORGANIZATION_DATA_SET_SCHEMA, getOrganizationDataSetSchema } = DataSetsApiActions;

export default function reducer(state :Map, action :SequenceAction) {
  return getOrganizationDataSetSchema.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_ORGANIZATION_DATA_SET_SCHEMA, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_ORGANIZATION_DATA_SET_SCHEMA, action.id], action),
    SUCCESS: () => {
      const storedSeqAction :?SequenceAction = state.getIn([GET_ORGANIZATION_DATA_SET_SCHEMA, action.id]);
      if (storedSeqAction) {
        const { dataSetId } = storedSeqAction.value;
        return state
          .setIn([DATA_SET_SCHEMA, dataSetId], action.value)
          .setIn([GET_ORGANIZATION_DATA_SET_SCHEMA, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => state.setIn([GET_ORGANIZATION_DATA_SET_SCHEMA, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([GET_ORGANIZATION_DATA_SET_SCHEMA, action.id]),
  });
}
