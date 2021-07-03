/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '~/common/constants';

import {
  GET_ORG_OBJECT_PERMISSIONS,
  getOrgObjectPermissions,
} from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return getOrgObjectPermissions.reducer(state, action, {
    REQUEST: () => state.setIn([GET_ORG_OBJECT_PERMISSIONS, REQUEST_STATE], RequestStates.PENDING),
    SUCCESS: () => state.setIn([GET_ORG_OBJECT_PERMISSIONS, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([GET_ORG_OBJECT_PERMISSIONS, REQUEST_STATE], RequestStates.FAILURE),
  });
}
