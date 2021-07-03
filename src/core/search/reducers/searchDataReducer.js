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
  SEARCH_DATA,
  searchData,
} from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return searchData.reducer(state, action, {
    REQUEST: () => state
      .setIn([SEARCH_DATA, REQUEST_STATE], RequestStates.PENDING)
      .setIn([SEARCH_DATA, action.id], action),
    SUCCESS: () => {
      const storedAction :SequenceAction = state.getIn([SEARCH_DATA, action.id]);
      if (storedAction) {
        return state
          .setIn([SEARCH_DATA, HITS], action.value[HITS])
          .setIn([SEARCH_DATA, PAGE], storedAction.value[PAGE])
          .setIn([SEARCH_DATA, QUERY], storedAction.value[QUERY])
          .setIn([SEARCH_DATA, TOTAL_HITS], action.value[TOTAL_HITS])
          .setIn([SEARCH_DATA, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      const storedAction :SequenceAction = state.getIn([SEARCH_DATA, action.id]);
      if (storedAction) {
        return state
          .setIn([SEARCH_DATA, ERROR], action.value)
          .setIn([SEARCH_DATA, HITS], List())
          .setIn([SEARCH_DATA, PAGE], storedAction.value[PAGE])
          .setIn([SEARCH_DATA, QUERY], storedAction.value[QUERY])
          .setIn([SEARCH_DATA, TOTAL_HITS], 0)
          .setIn([SEARCH_DATA, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([SEARCH_DATA, action.id]),
  });
}
