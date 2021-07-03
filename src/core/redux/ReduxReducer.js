/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import AccountReducer from '~/containers/account/reducers';
import AppReducer from '~/containers/app/reducers';
import ExploreReducer from '~/containers/explore/reducers';
import OrgsReducer from '~/containers/org/reducers';
import {
  ACCOUNT,
  APP,
  AUTH,
  DATA,
  EDM,
  EXPLORE,
  ORGANIZATIONS,
  PERMISSIONS,
  SEARCH,
  USERS,
} from '~/common/constants';

import DataReducer from '../data/reducers';
import EDMReducer from '../edm/reducers';
import PermissionsReducer from '../permissions/reducers';
import SearchReducer from '../search/reducers';
import UsersReducer from '../users/reducers';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    [ACCOUNT]: AccountReducer,
    [APP]: AppReducer,
    [AUTH]: AuthReducer,
    [DATA]: DataReducer,
    [EDM]: EDMReducer,
    [EXPLORE]: ExploreReducer,
    [ORGANIZATIONS]: OrgsReducer,
    [PERMISSIONS]: PermissionsReducer,
    [SEARCH]: SearchReducer,
    [USERS]: UsersReducer,
    router: connectRouter(routerHistory),
  });
}
