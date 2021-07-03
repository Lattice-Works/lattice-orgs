/*
 * @flow
 */

import { Map } from 'immutable';
import { Models } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { OrganizationObject, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ERROR, ORGANIZATIONS, REQUEST_STATE } from '~/common/constants';

const { Organization, OrganizationBuilder } = Models;
const { GET_ALL_ORGANIZATIONS, getAllOrganizations } = OrganizationsApiActions;

export default function reducer(state :Map, action :SequenceAction) {
  return getAllOrganizations.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_ALL_ORGANIZATIONS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_ALL_ORGANIZATIONS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GET_ALL_ORGANIZATIONS, action.id])) {
        const organizations :Map<UUID, Organization> = Map().asMutable();
        action.value.forEach((org :OrganizationObject) => {
          organizations.set(org.id, (new OrganizationBuilder(org)).build());
        });
        return state
          .set(ORGANIZATIONS, organizations.asImmutable())
          .setIn([GET_ALL_ORGANIZATIONS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_ALL_ORGANIZATIONS, action.id])) {
        return state
          .set(ORGANIZATIONS, Map())
          .setIn([GET_ALL_ORGANIZATIONS, ERROR], action.value)
          .setIn([GET_ALL_ORGANIZATIONS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_ALL_ORGANIZATIONS, action.id]),
  });
}
