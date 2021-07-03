/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '~/common/constants';
import { ADD_MEMBERS_TO_ORGANIZATION, addMembersToOrganization } from '../actions';

export default function addMembersToOrganizationReducer(state :Map, action :SequenceAction) {
  return addMembersToOrganization.reducer(state, action, {
    REQUEST: () => state
      .setIn([ADD_MEMBERS_TO_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([ADD_MEMBERS_TO_ORGANIZATION, action.id], action),
    SUCCESS: () => state.setIn([ADD_MEMBERS_TO_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([ADD_MEMBERS_TO_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([ADD_MEMBERS_TO_ORGANIZATION, action.id]),
  });
}
