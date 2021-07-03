/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { ERROR, ORGANIZATIONS, REQUEST_STATE } from '~/common/constants';

import { DELETE_EXISTING_ORGANIZATION, deleteExistingOrganization } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {
  return deleteExistingOrganization.reducer(state, action, {
    REQUEST: () => state
      .setIn([DELETE_EXISTING_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([DELETE_EXISTING_ORGANIZATION, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([DELETE_EXISTING_ORGANIZATION, action.id])) {
        return state
          .deleteIn([ORGANIZATIONS, action.value])
          .setIn([DELETE_EXISTING_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([DELETE_EXISTING_ORGANIZATION, action.id])) {
        return state
          .setIn([DELETE_EXISTING_ORGANIZATION, ERROR], action.value)
          .setIn([DELETE_EXISTING_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([DELETE_EXISTING_ORGANIZATION, action.id]),
  });
}
