/*
 * @flow
 */

import { List, Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { PersonUtils } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { Organization, Role, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ERROR,
  MEMBERS,
  ORGANIZATIONS,
  REQUEST_STATE,
} from '~/common/constants';

const { ADD_ROLE_TO_MEMBER, addRoleToMember } = OrganizationsApiActions;
const { getUserId } = PersonUtils;

export default function reducer(state :Map, action :SequenceAction) {
  return addRoleToMember.reducer(state, action, {
    REQUEST: () => state
      .setIn([ADD_ROLE_TO_MEMBER, REQUEST_STATE], RequestStates.PENDING)
      .setIn([ADD_ROLE_TO_MEMBER, action.id], action),
    SUCCESS: () => {
      const storedAction :?SequenceAction = state.getIn([ADD_ROLE_TO_MEMBER, action.id]);
      if (storedAction) {

        const {
          memberId,
          organizationId,
          roleId
        } :{
          memberId :string;
          organizationId :UUID;
          roleId :UUID;
        } = storedAction.value;

        const targetOrg :Organization = state.getIn([ORGANIZATIONS, organizationId]);
        const targetRole :?Role = targetOrg.roles.find((role) => role.id === roleId);
        const targetMemberIndex :number = state
          .getIn([MEMBERS, organizationId], List())
          .findIndex((member :Map) => getUserId(member) === memberId);

        if (targetRole && targetMemberIndex !== -1) {
          const targetMember :Map = state.getIn([MEMBERS, organizationId, targetMemberIndex], Map());
          const updatedMemberRoles :List = targetMember.get('roles', List()).push(targetRole.toImmutable());
          const updatedMember :Map = targetMember.set('roles', updatedMemberRoles);
          return state
            .setIn([MEMBERS, organizationId, targetMemberIndex], updatedMember)
            .setIn([ADD_ROLE_TO_MEMBER, REQUEST_STATE], RequestStates.SUCCESS);
        }
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([ADD_ROLE_TO_MEMBER, action.id])) {
        return state
          .setIn([ADD_ROLE_TO_MEMBER, ERROR], action.value)
          .setIn([ADD_ROLE_TO_MEMBER, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([ADD_ROLE_TO_MEMBER, action.id]),
  });
}
