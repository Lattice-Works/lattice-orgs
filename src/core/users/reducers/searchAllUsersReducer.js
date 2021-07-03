/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE, USER_SEARCH_RESULTS } from '~/common/constants';

import { SEARCH_ALL_USERS, searchAllUsers } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return searchAllUsers.reducer(state, action, {
    REQUEST: () => state
      .setIn([SEARCH_ALL_USERS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([SEARCH_ALL_USERS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([SEARCH_ALL_USERS, action.id])) {
        return state
          .set(USER_SEARCH_RESULTS, fromJS(action.value))
          .setIn([SEARCH_ALL_USERS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([SEARCH_ALL_USERS, action.id])) {
        return state
          .set(USER_SEARCH_RESULTS, Map())
          .setIn([SEARCH_ALL_USERS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([SEARCH_ALL_USERS, action.id]),
  });
}
