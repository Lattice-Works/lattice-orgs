/*
 * @flow
 */

import { Map } from 'immutable';
import { Models } from 'lattice';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { ERROR, ORGANIZATIONS, REQUEST_STATE } from '~/common/constants';

import { EDIT_ROLE_DETAILS, editRoleDetails } from '../actions';

const {
  Organization,
  OrganizationBuilder,
  RoleBuilder
} = Models;

export default function reducer(state :Map, action :SequenceAction) {
  return editRoleDetails.reducer(state, action, {
    REQUEST: () => state
      .setIn([EDIT_ROLE_DETAILS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([EDIT_ROLE_DETAILS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([EDIT_ROLE_DETAILS, action.id])) {

        const {
          description,
          organizationId,
          roleId,
          title,
        } = action.value;

        const org :Organization = state.getIn([ORGANIZATIONS, organizationId]);
        const updatedRoles = org.roles?.map((role) => {
          if (role.id === roleId) {
            return (new RoleBuilder(role))
              .setDescription(description)
              .setTitle(title)
              .build();
          }
          return role;
        });
        const updatedOrg = (new OrganizationBuilder(org))
          .setRoles(updatedRoles)
          .build();

        return state
          .setIn([ORGANIZATIONS, organizationId], updatedOrg)
          .setIn([EDIT_ROLE_DETAILS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([EDIT_ROLE_DETAILS, action.id])) {
        return state
          .setIn([EDIT_ROLE_DETAILS, ERROR], action.value)
          .setIn([EDIT_ROLE_DETAILS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([EDIT_ROLE_DETAILS, action.id]),
  });
}
