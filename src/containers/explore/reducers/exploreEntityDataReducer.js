/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { ERROR, REQUEST_STATE, SELECTED_ENTITY_DATA } from '~/common/constants';

import { EXPLORE_ENTITY_DATA, exploreEntityData } from '../actions';

export default function exploreEntityDataReducer(state :Map, action :SequenceAction) {
  return exploreEntityData.reducer(state, action, {
    REQUEST: () => state
      .setIn([EXPLORE_ENTITY_DATA, REQUEST_STATE], RequestStates.PENDING)
      .setIn([EXPLORE_ENTITY_DATA, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([EXPLORE_ENTITY_DATA, action.id])) {
        return state
          .set(SELECTED_ENTITY_DATA, fromJS(action.value))
          .setIn([EXPLORE_ENTITY_DATA, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => state
      .set(SELECTED_ENTITY_DATA, Map())
      .setIn([EXPLORE_ENTITY_DATA, ERROR], action.value)
      .setIn([EXPLORE_ENTITY_DATA, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([EXPLORE_ENTITY_DATA, action.id]),
  });
}
