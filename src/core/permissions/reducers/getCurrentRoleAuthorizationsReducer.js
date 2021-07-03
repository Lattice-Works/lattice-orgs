/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  CURRENT_ROLE_AUTHORIZATIONS,
  ERROR,
  REQUEST_STATE,
} from '~/common/constants';

import {
  GET_CURRENT_ROLE_AUTHORIZATIONS,
  getCurrentRoleAuthorizations,
} from '../actions';

export default function getCurrentRoleAuthorizationsReducer(state :Map, action :SequenceAction) {

  return getCurrentRoleAuthorizations.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_CURRENT_ROLE_AUTHORIZATIONS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_CURRENT_ROLE_AUTHORIZATIONS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GET_CURRENT_ROLE_AUTHORIZATIONS, action.id])) {
        return state
          .mergeIn([CURRENT_ROLE_AUTHORIZATIONS], action.value)
          .setIn([GET_CURRENT_ROLE_AUTHORIZATIONS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_CURRENT_ROLE_AUTHORIZATIONS, action.id])) {
        return state
          .setIn([GET_CURRENT_ROLE_AUTHORIZATIONS, ERROR], action.value)
          .setIn([GET_CURRENT_ROLE_AUTHORIZATIONS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_CURRENT_ROLE_AUTHORIZATIONS, action.id]),
  });
}
