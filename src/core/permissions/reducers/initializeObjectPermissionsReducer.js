/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '~/common/constants';

import { INITIALIZE_OBJECT_PERMISSIONS, initializeObjectPermissions } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return initializeObjectPermissions.reducer(state, action, {
    REQUEST: () => state.setIn([INITIALIZE_OBJECT_PERMISSIONS, REQUEST_STATE], RequestStates.PENDING),
    SUCCESS: () => state.setIn([INITIALIZE_OBJECT_PERMISSIONS, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([INITIALIZE_OBJECT_PERMISSIONS, REQUEST_STATE], RequestStates.FAILURE),
  });
}
