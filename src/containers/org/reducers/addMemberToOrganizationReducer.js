/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { MEMBERS, ORGS, REQUEST_STATE } from '../../../core/redux/constants';
import { sortOrganizationMembers } from '../utils';

const {
  Organization,
  OrganizationBuilder,
  Principal,
  PrincipalBuilder,
} = Models;
const { PrincipalTypes } = Types;
const { ADD_MEMBER_TO_ORGANIZATION, addMemberToOrganization } = OrganizationsApiActions;

export default function reducer(state :Map, action :SequenceAction) {
  return addMemberToOrganization.reducer(state, action, {
    REQUEST: () => state
      .setIn([ADD_MEMBER_TO_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([ADD_MEMBER_TO_ORGANIZATION, action.id], action),
    SUCCESS: () => {
      const storedAction :?SequenceAction = state.getIn([ADD_MEMBER_TO_ORGANIZATION, action.id]);
      if (storedAction) {

        const { memberId, organizationId, profile } = storedAction.value;
        const memberPrincipal :Principal = (new PrincipalBuilder())
          .setId(memberId)
          .setType(PrincipalTypes.USER)
          .build();

        const orgMemberObject = fromJS({
          principal: { principal: memberPrincipal.toImmutable() },
          profile,
          roles: List()
        });

        const currentOrg :Organization = state.getIn([ORGS, organizationId]);
        const updatedOrg :Map = currentOrg
          .toImmutable()
          .update(MEMBERS, (members :List = List()) => members.push(memberPrincipal));

        return state
          .updateIn(
            [MEMBERS, organizationId],
            (members :List = List()) => members.push(orgMemberObject).sort(sortOrganizationMembers),
          )
          .setIn([ORGS, organizationId], (new OrganizationBuilder(updatedOrg)).build())
          .setIn([ADD_MEMBER_TO_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([ADD_MEMBER_TO_ORGANIZATION, action.id])) {
        return state.setIn([ADD_MEMBER_TO_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([ADD_MEMBER_TO_ORGANIZATION, action.id]),
  });
}
