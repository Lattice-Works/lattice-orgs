/*
 * @flow
 */

import { Map } from 'immutable';
import { Models } from 'lattice';
import { RequestStates } from 'redux-reqseq';
import type { Organization, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ERROR, ORGANIZATIONS, REQUEST_STATE } from '~/common/constants';
import { REMOVE_ROLE_FROM_ORGANIZATION, removeRoleFromOrganization } from '../actions';

const { OrganizationBuilder } = Models;

export default function reducer(state :Map, action :SequenceAction) {
  return removeRoleFromOrganization.reducer(state, action, {
    REQUEST: () => state
      .setIn([REMOVE_ROLE_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([REMOVE_ROLE_FROM_ORGANIZATION, action.id], action),
    SUCCESS: () => {
      const storedAction :?SequenceAction = state.getIn([REMOVE_ROLE_FROM_ORGANIZATION, action.id]);
      if (storedAction) {

        const {
          organizationId,
          roleId,
        } :{|
          organizationId :UUID;
          roleId :UUID;
        |} = storedAction.value;

        const currentOrg :Organization = state.getIn([ORGANIZATIONS, organizationId]);
        const updatedRoles = currentOrg.roles.filter((role) => role.id !== roleId);
        const updatedOrg = (new OrganizationBuilder(currentOrg)).setRoles(updatedRoles).build();

        return state
          .setIn([ORGANIZATIONS, organizationId], updatedOrg)
          .setIn([REMOVE_ROLE_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([REMOVE_ROLE_FROM_ORGANIZATION, action.id])) {
        return state
          .setIn([REMOVE_ROLE_FROM_ORGANIZATION, ERROR], action.value)
          .setIn([REMOVE_ROLE_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([REMOVE_ROLE_FROM_ORGANIZATION, action.id]),
  });
}
