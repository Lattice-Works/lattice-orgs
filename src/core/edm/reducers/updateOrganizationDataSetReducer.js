/*
 * @flow
 */

import { Map } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ORG_DATA_SETS,
  ORG_DATA_SET_COLUMNS,
  REQUEST_STATE,
} from '~/common/constants';

import { UPDATE_ORGANIZATION_DATA_SET, updateOrganizationDataSet } from '../actions';

const { isValidUUID } = ValidationUtils;

export default function reducer(state :Map, action :SequenceAction) {

  return updateOrganizationDataSet.reducer(state, action, {
    REQUEST: () => state
      .setIn([UPDATE_ORGANIZATION_DATA_SET, REQUEST_STATE], RequestStates.PENDING)
      .setIn([UPDATE_ORGANIZATION_DATA_SET, action.id], action),
    SUCCESS: () => {
      const storedAction = state.getIn([UPDATE_ORGANIZATION_DATA_SET, action.id]);
      if (storedAction) {
        const {
          columnId,
          dataSetId,
          description,
          organizationId,
          title,
        } :{|
          columnId ?:UUID;
          dataSetId :UUID;
          description :string;
          organizationId :UUID;
          title :string;
        |} = storedAction.value;
        if (isValidUUID(columnId)) {
          return state
            .setIn([ORG_DATA_SET_COLUMNS, organizationId, dataSetId, columnId, 'metadata', 'description'], description)
            .setIn([ORG_DATA_SET_COLUMNS, organizationId, dataSetId, columnId, 'metadata', 'title'], title)
            .setIn([UPDATE_ORGANIZATION_DATA_SET, REQUEST_STATE], RequestStates.SUCCESS);
        }
        return state
          .setIn([ORG_DATA_SETS, organizationId, dataSetId, 'metadata', 'description'], description)
          .setIn([ORG_DATA_SETS, organizationId, dataSetId, 'metadata', 'title'], title)
          .setIn([UPDATE_ORGANIZATION_DATA_SET, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([UPDATE_ORGANIZATION_DATA_SET, action.id])) {
        return state.setIn([UPDATE_ORGANIZATION_DATA_SET, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([UPDATE_ORGANIZATION_DATA_SET, action.id]),
  });
}
