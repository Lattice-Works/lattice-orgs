/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ERROR, MEMBERS, REQUEST_STATE } from '~/common/constants';

import { sortOrganizationMembers } from '../utils';

const { GET_ORGANIZATION_MEMBERS, getOrganizationMembers } = OrganizationsApiActions;

export default function reducer(state :Map, action :SequenceAction) {
  return getOrganizationMembers.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_ORGANIZATION_MEMBERS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_ORGANIZATION_MEMBERS, action.id], action),
    SUCCESS: () => {
      const storedAction :?SequenceAction = state.getIn([GET_ORGANIZATION_MEMBERS, action.id]);
      if (storedAction) {
        const organizationId :UUID = storedAction.value;
        const sortedMembers = fromJS(action.value).sort(sortOrganizationMembers);
        return state
          .setIn([MEMBERS, organizationId], sortedMembers)
          .setIn([GET_ORGANIZATION_MEMBERS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      const storedAction :?SequenceAction = state.getIn([GET_ORGANIZATION_MEMBERS, action.id]);
      if (storedAction) {
        const organizationId :UUID = storedAction.value;
        return state
          .deleteIn([MEMBERS, organizationId])
          .setIn([GET_ORGANIZATION_MEMBERS, ERROR], action.value)
          .setIn([GET_ORGANIZATION_MEMBERS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_ORGANIZATION_MEMBERS, action.id]),
  });
}
