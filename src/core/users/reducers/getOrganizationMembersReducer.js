/*
 * @flow
 */

import { Map, fromJS, get } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { PersonUtils } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE, USERS } from '~/common/constants';

const { GET_ORGANIZATION_MEMBERS, getOrganizationMembers } = OrganizationsApiActions;
const { getUserId } = PersonUtils;

export default function reducer(state :Map, action :SequenceAction) {
  return getOrganizationMembers.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_ORGANIZATION_MEMBERS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_ORGANIZATION_MEMBERS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GET_ORGANIZATION_MEMBERS, action.id])) {
        const users = fromJS(action.value).toMap().mapEntries((entry :[number, Map]) => {
          const userId = getUserId(entry[1]);
          if (userId) {
            const user = entry[1];
            const auth0UserProfile = get(user, 'profile', user);
            return [userId, auth0UserProfile];
          }
          return null;
        });
        return state
          .mergeIn([USERS], users)
          .setIn([GET_ORGANIZATION_MEMBERS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_ORGANIZATION_MEMBERS, action.id])) {
        return state.setIn([GET_ORGANIZATION_MEMBERS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_ORGANIZATION_MEMBERS, action.id]),
  });
}
