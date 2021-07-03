/*
 * @flow
 */

import { List, Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { Ace, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ACES,
  ERROR,
  MY_KEYS,
  REQUEST_STATE,
} from '~/common/constants';

import { GET_PERMISSIONS, getPermissions } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return getPermissions.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_PERMISSIONS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_PERMISSIONS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GET_PERMISSIONS, action.id])) {
        const aces :Map<List<UUID>, List<Ace>> = action.value;
        const keys :List<List<UUID>> = aces.keySeq().toList();
        return state
          .mergeIn([ACES], aces)
          .mergeIn([MY_KEYS], keys)
          .setIn([GET_PERMISSIONS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_PERMISSIONS, action.id])) {
        return state
          .setIn([GET_PERMISSIONS, ERROR], action.value)
          .setIn([GET_PERMISSIONS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_PERMISSIONS, action.id]),
  });
}
