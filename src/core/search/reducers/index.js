/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import clearSearchStateReducer from './clearSearchStateReducer';
import searchDataReducer from './searchDataReducer';
import searchOrganizationDataSetsReducer from './searchOrganizationDataSetsReducer';

import { INITIAL_SEARCH_STATE } from '~/common/constants';
import { RESET_REQUEST_STATES } from '../../redux/actions';
import { resetRequestStatesReducer } from '../../redux/reducers';
import {
  CLEAR_SEARCH_STATE,
  SEARCH_DATA,
  SEARCH_ORGANIZATION_DATA_SETS,
  searchData,
  searchOrganizationDataSets,
} from '../actions';

const INITIAL_STATE :Map = fromJS({
  [SEARCH_DATA]: INITIAL_SEARCH_STATE,
  [SEARCH_ORGANIZATION_DATA_SETS]: INITIAL_SEARCH_STATE,
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case CLEAR_SEARCH_STATE: {
      return clearSearchStateReducer(state, action);
    }

    case RESET_REQUEST_STATES: {
      return resetRequestStatesReducer(state, action);
    }

    case searchData.case(action.type): {
      return searchDataReducer(state, action);
    }

    case searchOrganizationDataSets.case(action.type): {
      return searchOrganizationDataSetsReducer(state, action);
    }

    default:
      return state;
  }
}
