/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { ENTITY_NEIGHBORS_MAP, REQUEST_STATE } from '~/common/constants';

import { EXPLORE_ENTITY_NEIGHBORS, exploreEntityNeighbors } from '../actions';

export default function exploreEntityDataReducer(state :Map, action :SequenceAction) {
  return exploreEntityNeighbors.reducer(state, action, {
    REQUEST: () => state
      .setIn([EXPLORE_ENTITY_NEIGHBORS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([EXPLORE_ENTITY_NEIGHBORS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([EXPLORE_ENTITY_NEIGHBORS, action.id])) {
        const storedSeqAction = state.getIn([EXPLORE_ENTITY_NEIGHBORS, action.id]);
        const { entityKeyId } = storedSeqAction.value;
        return state
          .setIn([ENTITY_NEIGHBORS_MAP, entityKeyId], fromJS(action.value))
          .setIn([EXPLORE_ENTITY_NEIGHBORS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => state.setIn([EXPLORE_ENTITY_NEIGHBORS, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([EXPLORE_ENTITY_NEIGHBORS, action.id]),
  });
}
