/*
 * @flow
 */

import { Map } from 'immutable';
import { Models } from 'lattice';
import { RequestStates } from 'redux-reqseq';
import type { Organization } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ERROR, ORGANIZATIONS, REQUEST_STATE } from '~/common/constants';

import { EDIT_ORGANIZATION_DETAILS, editOrganizationDetails } from '../actions';

const { OrganizationBuilder } = Models;

export default function reducer(state :Map, action :SequenceAction) {
  return editOrganizationDetails.reducer(state, action, {
    REQUEST: () => state
      .setIn([EDIT_ORGANIZATION_DETAILS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([EDIT_ORGANIZATION_DETAILS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([EDIT_ORGANIZATION_DETAILS, action.id])) {
        const { organizationId, title, description } = action.value;
        const currentOrg :Organization = state.getIn([ORGANIZATIONS, organizationId]);
        const updatedOrg :Organization = (new OrganizationBuilder(currentOrg))
          .setDescription(description)
          .setTitle(title)
          .build();
        return state
          .setIn([ORGANIZATIONS, organizationId], updatedOrg)
          .setIn([EDIT_ORGANIZATION_DETAILS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([EDIT_ORGANIZATION_DETAILS, action.id])) {
        return state
          .setIn([EDIT_ORGANIZATION_DETAILS, ERROR], action.value)
          .setIn([EDIT_ORGANIZATION_DETAILS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([EDIT_ORGANIZATION_DETAILS, action.id]),
  });
}
