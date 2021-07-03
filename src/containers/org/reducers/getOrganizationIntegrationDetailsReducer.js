/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ERROR,
  INTEGRATION_DETAILS,
  REQUEST_STATE,
} from '~/common/constants';

import { GET_ORGANIZATION_INTEGRATION_DETAILS, getOrganizationIntegrationDetails } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return getOrganizationIntegrationDetails.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_ORGANIZATION_INTEGRATION_DETAILS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_ORGANIZATION_INTEGRATION_DETAILS, action.id], action),
    SUCCESS: () => state
      .setIn([GET_ORGANIZATION_INTEGRATION_DETAILS, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => {
      if (state.hasIn([GET_ORGANIZATION_INTEGRATION_DETAILS, action.id])) {
        return state
          .setIn([GET_ORGANIZATION_INTEGRATION_DETAILS, ERROR], action.value)
          .setIn([GET_ORGANIZATION_INTEGRATION_DETAILS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => {
      const storedAction = state.getIn([GET_ORGANIZATION_INTEGRATION_DETAILS, action.id]);
      if (storedAction) {
        const organizationId :UUID = storedAction.value;
        return state
          .setIn([INTEGRATION_DETAILS, organizationId], action.value)
          .deleteIn([GET_ORGANIZATION_INTEGRATION_DETAILS, action.id]);
      }
      return state.deleteIn([GET_ORGANIZATION_INTEGRATION_DETAILS, action.id]);
    }
  });
}
