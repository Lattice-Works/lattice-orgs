/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { DATA_SET_PERMISSIONS_PAGE, ERROR, REQUEST_STATE } from '~/common/constants';

import { GET_DATA_SET_PERMISSIONS_PAGE, getDataSetPermissionsPage } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return getDataSetPermissionsPage.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_DATA_SET_PERMISSIONS_PAGE, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_DATA_SET_PERMISSIONS_PAGE, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GET_DATA_SET_PERMISSIONS_PAGE, action.id])) {
        return state
          .set(DATA_SET_PERMISSIONS_PAGE, action.value)
          .setIn([GET_DATA_SET_PERMISSIONS_PAGE, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_DATA_SET_PERMISSIONS_PAGE, action.id])) {
        return state
          .set(DATA_SET_PERMISSIONS_PAGE, Map())
          .setIn([GET_DATA_SET_PERMISSIONS_PAGE, ERROR], action.value)
          .setIn([GET_DATA_SET_PERMISSIONS_PAGE, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_DATA_SET_PERMISSIONS_PAGE, action.id]),
  });
}
