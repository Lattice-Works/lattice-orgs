/*
 * @flow
 */

import { Map, Set, fromJS } from 'immutable';

import assignPermissionsToDataSetReducer from './assignPermissionsToDataSetReducer';
import createNewOrganizationReducer from './createNewOrganizationReducer';
import deleteExistingOrganizationReducer from './deleteExistingOrganizationReducer';
import getCurrentRoleAuthorizationsReducer from './getCurrentRoleAuthorizationsReducer';
import getDataSetPermissionsPageReducer from './getDataSetPermissionsPageReducer';
import getOrgDataSetObjectPermissionsReducer from './getOrgDataSetObjectPermissionsReducer';
import getOrgObjectPermissionsReducer from './getOrgObjectPermissionsReducer';
import getOrgRoleObjectPermissionsReducer from './getOrgRoleObjectPermissionsReducer';
import getPermissionsReducer from './getPermissionsReducer';
import initializeObjectPermissionsReducer from './initializeObjectPermissionsReducer';
import initializeOrganizationDataSetReducer from './initializeOrganizationDataSetReducer';
import initializeOrganizationReducer from './initializeOrganizationReducer';
import setPermissionsReducer from './setPermissionsReducer';
import updatePermissionsReducer from './updatePermissionsReducer';

import {
  ACES,
  CURRENT,
  CURRENT_ROLE_AUTHORIZATIONS,
  DATA_SET_PERMISSIONS_PAGE,
  MY_KEYS,
  RS_INITIAL_STATE,
} from '~/common/constants';
import {
  createNewOrganization,
  deleteExistingOrganization,
  initializeOrganization,
} from '~/containers/org/actions';
import { initializeOrganizationDataSet } from '../../edm/actions';
import { RESET_REQUEST_STATES } from '../../redux/actions';
import { resetRequestStatesReducer } from '../../redux/reducers';
import {
  ASSIGN_PERMISSIONS_TO_DATA_SET,
  GET_CURRENT_ROLE_AUTHORIZATIONS,
  GET_DATA_SET_PERMISSIONS_PAGE,
  GET_ORG_DATA_SET_OBJECT_PERMISSIONS,
  GET_ORG_OBJECT_PERMISSIONS,
  GET_ORG_ROLE_OBJECT_PERMISSIONS,
  GET_PERMISSIONS,
  INITIALIZE_OBJECT_PERMISSIONS,
  RESET_CURRENT_ROLE_AUTHORIZATIONS,
  SET_PERMISSIONS,
  UPDATE_PERMISSIONS,
  assignPermissionsToDataSet,
  getCurrentRoleAuthorizations,
  getDataSetPermissionsPage,
  getOrgDataSetObjectPermissions,
  getOrgObjectPermissions,
  getOrgRoleObjectPermissions,
  getPermissions,
  initializeObjectPermissions,
  setPermissions,
  updatePermissions,
} from '../actions';

const INITIAL_STATE :Map = fromJS({
  // actions
  [ASSIGN_PERMISSIONS_TO_DATA_SET]: RS_INITIAL_STATE,
  [GET_CURRENT_ROLE_AUTHORIZATIONS]: RS_INITIAL_STATE,
  [GET_DATA_SET_PERMISSIONS_PAGE]: RS_INITIAL_STATE,
  [GET_ORG_DATA_SET_OBJECT_PERMISSIONS]: RS_INITIAL_STATE,
  [GET_ORG_OBJECT_PERMISSIONS]: RS_INITIAL_STATE,
  [GET_ORG_ROLE_OBJECT_PERMISSIONS]: RS_INITIAL_STATE,
  [GET_PERMISSIONS]: RS_INITIAL_STATE,
  [INITIALIZE_OBJECT_PERMISSIONS]: RS_INITIAL_STATE,
  [SET_PERMISSIONS]: RS_INITIAL_STATE,
  [UPDATE_PERMISSIONS]: RS_INITIAL_STATE,
  // data
  [ACES]: Map(),
  [CURRENT]: Map(),
  [CURRENT_ROLE_AUTHORIZATIONS]: Map(),
  [DATA_SET_PERMISSIONS_PAGE]: Map(),
  [MY_KEYS]: Set(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATES: {
      return resetRequestStatesReducer(state, action);
    }

    case RESET_CURRENT_ROLE_AUTHORIZATIONS: {
      return state.set(CURRENT_ROLE_AUTHORIZATIONS, INITIAL_STATE.get(CURRENT_ROLE_AUTHORIZATIONS));
    }

    case assignPermissionsToDataSet.case(action.type): {
      return assignPermissionsToDataSetReducer(state, action);
    }

    case createNewOrganization.case(action.type): {
      return createNewOrganizationReducer(state, action);
    }

    case deleteExistingOrganization.case(action.type): {
      return deleteExistingOrganizationReducer(state, action);
    }

    case getCurrentRoleAuthorizations.case(action.type): {
      return getCurrentRoleAuthorizationsReducer(state, action);
    }

    case getDataSetPermissionsPage.case(action.type): {
      return getDataSetPermissionsPageReducer(state, action);
    }

    case getOrgDataSetObjectPermissions.case(action.type): {
      return getOrgDataSetObjectPermissionsReducer(state, action);
    }

    case getOrgObjectPermissions.case(action.type): {
      return getOrgObjectPermissionsReducer(state, action);
    }

    case getOrgRoleObjectPermissions.case(action.type): {
      return getOrgRoleObjectPermissionsReducer(state, action);
    }

    case getPermissions.case(action.type): {
      return getPermissionsReducer(state, action);
    }

    case initializeObjectPermissions.case(action.type): {
      return initializeObjectPermissionsReducer(state, action);
    }

    case initializeOrganization.case(action.type): {
      return initializeOrganizationReducer(state, action);
    }

    case initializeOrganizationDataSet.case(action.type): {
      return initializeOrganizationDataSetReducer(state, action);
    }

    case setPermissions.case(action.type): {
      return setPermissionsReducer(state, action);
    }

    case updatePermissions.case(action.type): {
      return updatePermissionsReducer(state, action);
    }

    default:
      return state;
  }
}
