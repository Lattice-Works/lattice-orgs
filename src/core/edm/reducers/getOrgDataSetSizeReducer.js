/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { ENTITY_SET_SIZE_MAP, REQUEST_STATE } from '~/common/constants';

import { GET_ORG_DATA_SET_SIZE, getOrgDataSetSize } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return getOrgDataSetSize.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_ORG_DATA_SET_SIZE, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_ORG_DATA_SET_SIZE, action.id], action),
    SUCCESS: () => {
      const storedSeqAction :?SequenceAction = state.getIn([GET_ORG_DATA_SET_SIZE, action.id]);
      if (storedSeqAction) {
        const {
          dataSetId,
          organizationId
        } = storedSeqAction.value;
        return state
          .setIn([ENTITY_SET_SIZE_MAP, organizationId, dataSetId], action.value)
          .setIn([GET_ORG_DATA_SET_SIZE, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_ORG_DATA_SET_SIZE, action.id])) {
        return state.setIn([GET_ORG_DATA_SET_SIZE, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_ORG_DATA_SET_SIZE, action.id]),
  });
}
