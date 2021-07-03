/*
 * @flow
 */

import { Map } from 'immutable';
import { Types } from 'lattice';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { ACES, ERROR, REQUEST_STATE } from '~/common/constants';

import {
  ASSIGN_PERMISSIONS_TO_DATA_SET,
  assignPermissionsToDataSet,
} from '../actions';
import { updatePermissionsInState } from '../utils';

const { ActionTypes } = Types;
export default function reducer(state :Map, action :SequenceAction) {

  return assignPermissionsToDataSet.reducer(state, action, {
    REQUEST: () => state
      .setIn([ASSIGN_PERMISSIONS_TO_DATA_SET, REQUEST_STATE], RequestStates.PENDING)
      .setIn([ASSIGN_PERMISSIONS_TO_DATA_SET, action.id], action),
    SUCCESS: () => {
      const { permissions } = action.value;
      const stateAces = state.get(ACES);
      const aces = updatePermissionsInState(ActionTypes.ADD, permissions, stateAces);
      return state
        .set(ACES, aces)
        .setIn([ASSIGN_PERMISSIONS_TO_DATA_SET, REQUEST_STATE], RequestStates.SUCCESS);
    },
    FAILURE: () => {
      if (state.hasIn([ASSIGN_PERMISSIONS_TO_DATA_SET, action.id])) {
        return state
          .setIn([ASSIGN_PERMISSIONS_TO_DATA_SET, ERROR], action.value)
          .setIn([ASSIGN_PERMISSIONS_TO_DATA_SET, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([ASSIGN_PERMISSIONS_TO_DATA_SET, action.id]),
  });
}
