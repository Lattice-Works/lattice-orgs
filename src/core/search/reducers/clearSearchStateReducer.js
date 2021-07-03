/*
 * @flow
 */

import { Map } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';

import { INITIAL_SEARCH_STATE } from '~/common/constants';

export default function reducer(state :Map, action :SequenceAction) {

  if (action.value && state.has(action.value)) {
    return state.set(action.value, INITIAL_SEARCH_STATE);
  }

  return state;
}
