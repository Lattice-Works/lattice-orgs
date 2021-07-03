/*
 * @flow
 */

import { Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  DATA_SET_SCHEMA,
  ERROR,
  OPENLATTICE,
  REQUEST_STATE,
} from '~/common/constants';

const { PROMOTE_STAGING_TABLE, promoteStagingTable } = OrganizationsApiActions;

export default function promoteStagingTableReducer(state :Map, action :SequenceAction) {
  return promoteStagingTable.reducer(state, action, {
    REQUEST: () => state
      .setIn([PROMOTE_STAGING_TABLE, REQUEST_STATE], RequestStates.PENDING)
      .setIn([PROMOTE_STAGING_TABLE, action.id], action),
    SUCCESS: () => {
      const storedSeqAction :?SequenceAction = state.getIn([PROMOTE_STAGING_TABLE, action.id]);
      if (storedSeqAction) {
        const { dataSetId } = storedSeqAction.value;
        return state
          .setIn([DATA_SET_SCHEMA, dataSetId], OPENLATTICE)
          .setIn([PROMOTE_STAGING_TABLE, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => state
      .setIn([PROMOTE_STAGING_TABLE, ERROR], action.value)
      .setIn([PROMOTE_STAGING_TABLE, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([PROMOTE_STAGING_TABLE, action.id]),
  });
}
