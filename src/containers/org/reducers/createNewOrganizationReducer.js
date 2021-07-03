/*
 * @flow
 */

import { Map } from 'immutable';
import { Models } from 'lattice';
import { RequestStates } from 'redux-reqseq';
import type { Organization } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ERROR,
  NEW_ORGANIZATION_ID,
  ORGANIZATIONS,
  REQUEST_STATE,
} from '~/common/constants';

import { CREATE_NEW_ORGANIZATION, createNewOrganization } from '../actions';

const { OrganizationBuilder } = Models;

export default function reducer(state :Map, action :SequenceAction) {
  return createNewOrganization.reducer(state, action, {
    REQUEST: () => state
      .setIn([CREATE_NEW_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([CREATE_NEW_ORGANIZATION, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([CREATE_NEW_ORGANIZATION, action.id])) {
        const org :Organization = (new OrganizationBuilder(action.value)).build();
        return state
          .setIn([ORGANIZATIONS, org.id], org)
          .set(NEW_ORGANIZATION_ID, org.id)
          .setIn([CREATE_NEW_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([CREATE_NEW_ORGANIZATION, action.id])) {
        return state
          .setIn([CREATE_NEW_ORGANIZATION, ERROR], action.value)
          .setIn([CREATE_NEW_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([CREATE_NEW_ORGANIZATION, action.id]),
  });
}
