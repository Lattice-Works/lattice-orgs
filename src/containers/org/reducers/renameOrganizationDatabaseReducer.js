/*
 * @flow
 */

import { Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  DATABASE_NAME,
  ERROR,
  INTEGRATION_DETAILS,
  REQUEST_STATE
} from '~/common/constants';

const { RENAME_ORGANIZATION_DATABASE, renameOrganizationDatabase } = OrganizationsApiActions;

export default function reducer(state :Map, action :SequenceAction) {

  return renameOrganizationDatabase.reducer(state, action, {
    REQUEST: () => state
      .setIn([RENAME_ORGANIZATION_DATABASE, REQUEST_STATE], RequestStates.PENDING)
      .setIn([RENAME_ORGANIZATION_DATABASE, action.id], action),
    SUCCESS: () => {
      const storedAction :?SequenceAction = state.getIn([RENAME_ORGANIZATION_DATABASE, action.id]);
      if (storedAction) {
        const {
          databaseName,
          organizationId,
        } :{
          databaseName :string;
          organizationId :UUID;
        } = storedAction.value;
        return state
          .setIn([INTEGRATION_DETAILS, organizationId, DATABASE_NAME], databaseName)
          .setIn([RENAME_ORGANIZATION_DATABASE, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([RENAME_ORGANIZATION_DATABASE, action.id])) {
        return state
          .setIn([RENAME_ORGANIZATION_DATABASE, ERROR], action.value)
          .setIn([RENAME_ORGANIZATION_DATABASE, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([RENAME_ORGANIZATION_DATABASE, action.id]),
  });
}
