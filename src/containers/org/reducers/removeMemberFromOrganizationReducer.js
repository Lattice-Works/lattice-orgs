/*
 * @flow
 */

import { List, Map } from 'immutable';
import { Models } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import { PersonUtils } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { Organization, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ERROR,
  MEMBERS,
  ORGANIZATIONS,
  REQUEST_STATE,
} from '~/common/constants';

const { OrganizationBuilder } = Models;
const { REMOVE_MEMBER_FROM_ORGANIZATION, removeMemberFromOrganization } = OrganizationsApiActions;
const { getUserId } = PersonUtils;

const removeMember = (memberId :string) => (members :List = List()) => (
  members.filter((member :Map) => getUserId(member) !== memberId)
);

export default function reducer(state :Map, action :SequenceAction) {
  return removeMemberFromOrganization.reducer(state, action, {
    REQUEST: () => state
      .setIn([REMOVE_MEMBER_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([REMOVE_MEMBER_FROM_ORGANIZATION, action.id], action),
    SUCCESS: () => {
      const storedAction :?SequenceAction = state.getIn([REMOVE_MEMBER_FROM_ORGANIZATION, action.id]);
      if (storedAction) {

        const {
          memberId,
          organizationId
        } :{
          memberId :string;
          organizationId :UUID;
        } = storedAction.value;

        const currentOrg :Organization = state.getIn([ORGANIZATIONS, organizationId]);
        const updatedOrg :Map = currentOrg.toImmutable().update(MEMBERS, removeMember(memberId));

        return state
          .updateIn([MEMBERS, organizationId], removeMember(memberId))
          .setIn([ORGANIZATIONS, organizationId], (new OrganizationBuilder(updatedOrg)).build())
          .setIn([REMOVE_MEMBER_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([REMOVE_MEMBER_FROM_ORGANIZATION, action.id])) {
        return state
          .setIn([REMOVE_MEMBER_FROM_ORGANIZATION, ERROR], action.value)
          .setIn([REMOVE_MEMBER_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([REMOVE_MEMBER_FROM_ORGANIZATION, action.id]),
  });
}
