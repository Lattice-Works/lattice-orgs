/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '~/common/constants';

import { ASSIGN_ROLES_TO_MEMBERS, assignRolesToMembers } from '../actions';

export default function assignRolesToMembersReducer(state :Map, action :SequenceAction) {
  return assignRolesToMembers.reducer(state, action, {
    REQUEST: () => state
      .setIn([ASSIGN_ROLES_TO_MEMBERS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([ASSIGN_ROLES_TO_MEMBERS, action.id], action),
    SUCCESS: () => state.setIn([ASSIGN_ROLES_TO_MEMBERS, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([ASSIGN_ROLES_TO_MEMBERS, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([ASSIGN_ROLES_TO_MEMBERS, action.id]),
  });
}
