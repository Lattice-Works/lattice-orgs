/*
 * @flow
 */

import { List, Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type {
  Ace,
  ActionType,
  UUID,
} from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ACES,
  ERROR,
  REQUEST_STATE,
} from '~/common/constants';

import {
  UPDATE_PERMISSIONS,
  updatePermissions,
} from '../actions';
import { updatePermissionsInState } from '../utils';

export default function reducer(state :Map, action :SequenceAction) {

  return updatePermissions.reducer(state, action, {
    REQUEST: () => state
      .setIn([UPDATE_PERMISSIONS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([UPDATE_PERMISSIONS, action.id], action),
    SUCCESS: () => {
      const storedAction :?SequenceAction = state.getIn([UPDATE_PERMISSIONS, action.id]);
      if (storedAction) {

        const permissionsUpdates :Array<{
          actionType :ActionType;
          permissions :Map<List<UUID>, Ace>;
        }> = storedAction.value;

        let updatedAces = state.get(ACES);
        permissionsUpdates.forEach(({ actionType, permissions }) => {
          updatedAces = updatePermissionsInState(actionType, permissions, updatedAces);
        });

        return state
          .set(ACES, updatedAces)
          .setIn([UPDATE_PERMISSIONS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([UPDATE_PERMISSIONS, action.id])) {
        return state
          .setIn([UPDATE_PERMISSIONS, ERROR], action.value)
          .setIn([UPDATE_PERMISSIONS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([UPDATE_PERMISSIONS, action.id]),
  });
}
