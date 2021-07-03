/*
 * @flow
 */

import { Map } from 'immutable';
import { Models } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { Organization } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ERROR, ORGANIZATIONS, REQUEST_STATE } from '~/common/constants';

const { OrganizationBuilder } = Models;
const { GET_ORGANIZATION, getOrganization } = OrganizationsApiActions;

export default function reducer(state :Map, action :SequenceAction) {
  return getOrganization.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_ORGANIZATION, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GET_ORGANIZATION, action.id])) {
        const organization :Organization = (new OrganizationBuilder(action.value)).build();
        return state
          .setIn([ORGANIZATIONS, organization.id], organization)
          .setIn([GET_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_ORGANIZATION, action.id])) {
        return state
          .setIn([GET_ORGANIZATION, ERROR], action.value)
          .setIn([GET_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_ORGANIZATION, action.id]),
  });
}
