/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import fetchEntitySetDataReducer from './fetchEntitySetDataReducer';

import { ENTITY_SET_DATA } from '~/common/constants';
import { RESET_REQUEST_STATES } from '../../redux/actions';
import { resetRequestStatesReducer } from '../../redux/reducers';
import {
  FETCH_ENTITY_SET_DATA,
  fetchEntitySetData,
} from '../actions';

const INITIAL_STATE :Map = fromJS({
  // actions
  [FETCH_ENTITY_SET_DATA]: Map(),
  // data
  [ENTITY_SET_DATA]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATES: {
      return resetRequestStatesReducer(state, action);
    }

    case fetchEntitySetData.case(action.type): {
      return fetchEntitySetDataReducer(state, action);
    }

    default:
      return state;
  }
}
