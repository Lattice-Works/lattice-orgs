/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { matchPath } from 'react-router';

import { ENTITY_NEIGHBORS_MAP, RS_INITIAL_STATE, SELECTED_ENTITY_DATA } from '~/common/constants';
import { RESET_REQUEST_STATES } from '~/core/redux/actions';
import { resetRequestStatesReducer } from '~/core/redux/reducers';
import { Routes, RoutingActions } from '~/core/router';
import type { RoutingAction } from '~/core/router/actions';

import exploreEntityDataReducer from './exploreEntityDataReducer';
import exploreEntityNeighborsReducer from './exploreEntityNeighborsReducer';

import {
  EXPLORE_ENTITY_DATA,
  EXPLORE_ENTITY_NEIGHBORS,
  exploreEntityData,
  exploreEntityNeighbors,
} from '../actions';

const { GO_TO_ROUTE } = RoutingActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [EXPLORE_ENTITY_DATA]: RS_INITIAL_STATE,
  [EXPLORE_ENTITY_NEIGHBORS]: RS_INITIAL_STATE,
  // data
  [ENTITY_NEIGHBORS_MAP]: Map(),
  [SELECTED_ENTITY_DATA]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case GO_TO_ROUTE: {
      const routingAction :RoutingAction = action;
      if (matchPath(routingAction.route, Routes.ENTITY) && routingAction.state.data) {
        return state.set(SELECTED_ENTITY_DATA, fromJS(routingAction.state.data));
      }
      return state;
    }

    case RESET_REQUEST_STATES: {
      return resetRequestStatesReducer(state, action);
    }

    case exploreEntityData.case(action.type): {
      return exploreEntityDataReducer(state, action);
    }

    case exploreEntityNeighbors.case(action.type): {
      return exploreEntityNeighborsReducer(state, action);
    }

    default:
      return state;
  }
}
