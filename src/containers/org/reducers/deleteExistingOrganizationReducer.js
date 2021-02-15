/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { IS_OWNER, ORGS, REQUEST_STATE } from '../../../core/redux/constants';
import { DELETE_EXISTING_ORGANIZATION, deleteExistingOrganization } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {
  return deleteExistingOrganization.reducer(state, action, {
    REQUEST: () => state
      .setIn([DELETE_EXISTING_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([DELETE_EXISTING_ORGANIZATION, action.id], action),
    SUCCESS: () => state
      .setIn([DELETE_EXISTING_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS)
      .deleteIn([ORGS, action.value])
      .deleteIn([ORGS, IS_OWNER, action.value]),
    FAILURE: () => state.setIn([DELETE_EXISTING_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([DELETE_EXISTING_ORGANIZATION, action.id]),
  });
}