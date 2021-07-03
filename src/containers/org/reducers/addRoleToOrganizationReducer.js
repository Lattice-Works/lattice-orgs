/*
 * @flow
 */

import { Map } from 'immutable';
import { Models } from 'lattice';
import { RequestStates } from 'redux-reqseq';
import type { Organization, Role } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ERROR, ORGANIZATIONS, REQUEST_STATE } from '~/common/constants';

import { ADD_ROLE_TO_ORGANIZATION, addRoleToOrganization } from '../actions';

const { OrganizationBuilder } = Models;

export default function reducer(state :Map, action :SequenceAction) {
  return addRoleToOrganization.reducer(state, action, {
    REQUEST: () => state
      .setIn([ADD_ROLE_TO_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([ADD_ROLE_TO_ORGANIZATION, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([ADD_ROLE_TO_ORGANIZATION, action.id])) {

        const role :Role = action.value;
        const org :Organization = state.getIn([ORGANIZATIONS, role.organizationId]);
        const updatedRoles = [...org.roles, role].sort((roleA, roleB) => (roleA.title.localeCompare(roleB.title)));
        const updatedOrg = (new OrganizationBuilder(org))
          .setRoles(updatedRoles)
          .build();

        return state
          .setIn([ORGANIZATIONS, role.organizationId], updatedOrg)
          .setIn([ADD_ROLE_TO_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([ADD_ROLE_TO_ORGANIZATION, action.id])) {
        return state
          .setIn([ADD_ROLE_TO_ORGANIZATION, ERROR], action.value)
          .setIn([ADD_ROLE_TO_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([ADD_ROLE_TO_ORGANIZATION, action.id]),
  });
}
