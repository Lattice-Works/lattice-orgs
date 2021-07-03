/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { PrincipalsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE, USERS } from '~/common/constants';

const {
  GET_USERS,
  getUsers,
} = PrincipalsApiActions;

export default function reducer(state :Map, action :SequenceAction) {

  return getUsers.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_USERS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_USERS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GET_USERS, action.id])) {
        return state
          .mergeIn([USERS], fromJS(action.value))
          .setIn([GET_USERS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_USERS, action.id])) {
        return state.setIn([GET_USERS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_USERS, action.id]),
  });
}
