/*
 * @flow
 */

import { List, Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  ERROR,
  HITS,
  PAGE,
  QUERY,
  REQUEST_STATE,
  TOTAL_HITS,
} from '~/common/constants';

import {
  SEARCH_ORGANIZATION_DATA_SETS,
  searchOrganizationDataSets,
} from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return searchOrganizationDataSets.reducer(state, action, {
    REQUEST: () => state
      .setIn([SEARCH_ORGANIZATION_DATA_SETS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([SEARCH_ORGANIZATION_DATA_SETS, action.id], action),
    SUCCESS: () => {
      const storedAction :SequenceAction = state.getIn([SEARCH_ORGANIZATION_DATA_SETS, action.id]);
      if (storedAction) {
        return state
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, HITS], action.value[HITS])
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, PAGE], storedAction.value[PAGE])
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, QUERY], storedAction.value[QUERY])
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, TOTAL_HITS], action.value[TOTAL_HITS])
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      const storedAction :SequenceAction = state.getIn([SEARCH_ORGANIZATION_DATA_SETS, action.id]);
      if (storedAction) {
        return state
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, ERROR], action.value)
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, HITS], List())
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, PAGE], storedAction.value[PAGE])
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, QUERY], storedAction.value[QUERY])
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, TOTAL_HITS], 0)
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([SEARCH_ORGANIZATION_DATA_SETS, action.id]),
  });
}
