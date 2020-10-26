/*
 * @flow
 */

import { Map, Set } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  ERROR,
  HITS,
  PAGE,
  QUERY,
  REQUEST_STATE,
  TOTAL_HITS,
} from '../../redux/constants';
import {
  SEARCH_DATA_SETS_TO_FILTER as SEARCH_DATA_SETS,
  searchDataSetsToFilter as searchDataSets,
} from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return searchDataSets.reducer(state, action, {
    REQUEST: () => state
      .setIn([SEARCH_DATA_SETS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([SEARCH_DATA_SETS, action.id], action),
    SUCCESS: () => {
      const storedAction :SequenceAction = state.getIn([SEARCH_DATA_SETS, action.id]);
      if (storedAction) {
        const { page, query } = storedAction.value;
        return state
          .setIn([SEARCH_DATA_SETS, HITS], action.value[HITS])
          .setIn([SEARCH_DATA_SETS, PAGE], page)
          .setIn([SEARCH_DATA_SETS, QUERY], query)
          .setIn([SEARCH_DATA_SETS, TOTAL_HITS], action.value[TOTAL_HITS])
          .setIn([SEARCH_DATA_SETS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([SEARCH_DATA_SETS, action.id])) {
        return state
          .setIn([SEARCH_DATA_SETS, ERROR], action.value)
          .setIn([SEARCH_DATA_SETS, HITS], Set())
          .setIn([SEARCH_DATA_SETS, TOTAL_HITS], 0)
          .setIn([SEARCH_DATA_SETS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([SEARCH_DATA_SETS, action.id]),
  });
}
