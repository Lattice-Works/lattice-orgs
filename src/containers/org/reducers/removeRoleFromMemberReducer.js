/*
 * @flow
 */

import { List, Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { PersonUtils } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ERROR, MEMBERS, REQUEST_STATE } from '~/common/constants';

const { REMOVE_ROLE_FROM_MEMBER, removeRoleFromMember } = OrganizationsApiActions;
const { getUserId } = PersonUtils;

export default function reducer(state :Map, action :SequenceAction) {
  return removeRoleFromMember.reducer(state, action, {
    REQUEST: () => state
      .setIn([REMOVE_ROLE_FROM_MEMBER, REQUEST_STATE], RequestStates.PENDING)
      .setIn([REMOVE_ROLE_FROM_MEMBER, action.id], action),
    SUCCESS: () => {
      const storedAction :?SequenceAction = state.getIn([REMOVE_ROLE_FROM_MEMBER, action.id]);
      if (storedAction) {

        const {
          memberId,
          organizationId,
          roleId,
        } :{
          memberId :string;
          organizationId :UUID;
          roleId :UUID;
        } = storedAction.value;

        const targetMemberIndex :number = state
          .getIn([MEMBERS, organizationId], List())
          .findIndex((member :Map) => getUserId(member) === memberId);

        if (targetMemberIndex !== -1) {
          const targetMember :Map = state.getIn([MEMBERS, organizationId, targetMemberIndex], Map());
          const targetRoleIndex :number = targetMember
            .get('roles', List())
            .findIndex((role :Map) => role.get('id') === roleId);
          if (targetRoleIndex !== -1) {
            const updatedMember = targetMember.deleteIn(['roles', targetRoleIndex]);
            return state
              .setIn([MEMBERS, organizationId, targetMemberIndex], updatedMember)
              .setIn([REMOVE_ROLE_FROM_MEMBER, REQUEST_STATE], RequestStates.SUCCESS);
          }
        }
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([REMOVE_ROLE_FROM_MEMBER, action.id])) {
        return state
          .setIn([REMOVE_ROLE_FROM_MEMBER, ERROR], action.value)
          .setIn([REMOVE_ROLE_FROM_MEMBER, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([REMOVE_ROLE_FROM_MEMBER, action.id]),
  });
}
