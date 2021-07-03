/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';

import addMemberToOrganizationReducer from './addMemberToOrganizationReducer';
import addMembersToOrganizationReducer from './addMembersToOrganizationReducer';
import addRoleToMemberReducer from './addRoleToMemberReducer';
import addRoleToOrganizationReducer from './addRoleToOrganizationReducer';
import assignRolesToMembersReducer from './assignRolesToMembersReducer';
import createNewOrganizationReducer from './createNewOrganizationReducer';
import deleteExistingOrganizationReducer from './deleteExistingOrganizationReducer';
import editOrganizationDetailsReducer from './editOrganizationDetailsReducer';
import editRoleDetailsReducer from './editRoleDetailsReducer';
import getAllOrganizationsReducer from './getAllOrganizationsReducer';
import getOrganizationIntegrationDetailsReducer from './getOrganizationIntegrationDetailsReducer';
import getOrganizationMembersReducer from './getOrganizationMembersReducer';
import getOrganizationReducer from './getOrganizationReducer';
import initializeOrganizationReducer from './initializeOrganizationReducer';
import removeMemberFromOrganizationReducer from './removeMemberFromOrganizationReducer';
import removeRoleFromMemberReducer from './removeRoleFromMemberReducer';
import removeRoleFromOrganizationReducer from './removeRoleFromOrganizationReducer';
import renameOrganizationDatabaseReducer from './renameOrganizationDatabaseReducer';

import {
  INTEGRATION_DETAILS,
  MEMBERS,
  NEW_ORGANIZATION_ID,
  ORGANIZATIONS,
  RS_INITIAL_STATE,
} from '~/common/constants';
import { RESET_REQUEST_STATES } from '~/core/redux/actions';
import { resetRequestStatesReducer } from '~/core/redux/reducers';
import {
  ADD_MEMBERS_TO_ORGANIZATION,
  ADD_ROLE_TO_ORGANIZATION,
  ASSIGN_ROLES_TO_MEMBERS,
  CREATE_NEW_ORGANIZATION,
  DELETE_EXISTING_ORGANIZATION,
  EDIT_ORGANIZATION_DETAILS,
  EDIT_ROLE_DETAILS,
  GET_ORGANIZATION_INTEGRATION_DETAILS,
  INITIALIZE_ORGANIZATION,
  REMOVE_ROLE_FROM_ORGANIZATION,
  addMembersToOrganization,
  addRoleToOrganization,
  assignRolesToMembers,
  createNewOrganization,
  deleteExistingOrganization,
  editOrganizationDetails,
  editRoleDetails,
  getOrganizationIntegrationDetails,
  initializeOrganization,
  removeRoleFromOrganization,
} from '../actions';

const {
  ADD_MEMBER_TO_ORGANIZATION,
  ADD_ROLE_TO_MEMBER,
  GET_ALL_ORGANIZATIONS,
  GET_ORGANIZATION,
  GET_ORGANIZATION_MEMBERS,
  REMOVE_MEMBER_FROM_ORGANIZATION,
  REMOVE_ROLE_FROM_MEMBER,
  RENAME_ORGANIZATION_DATABASE,
  addMemberToOrganization,
  addRoleToMember,
  getAllOrganizations,
  getOrganization,
  getOrganizationMembers,
  removeMemberFromOrganization,
  removeRoleFromMember,
  renameOrganizationDatabase,
} = OrganizationsApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [ADD_MEMBERS_TO_ORGANIZATION]: RS_INITIAL_STATE,
  [ADD_MEMBER_TO_ORGANIZATION]: RS_INITIAL_STATE,
  [ADD_ROLE_TO_MEMBER]: RS_INITIAL_STATE,
  [ADD_ROLE_TO_ORGANIZATION]: RS_INITIAL_STATE,
  [ASSIGN_ROLES_TO_MEMBERS]: RS_INITIAL_STATE,
  [CREATE_NEW_ORGANIZATION]: RS_INITIAL_STATE,
  [DELETE_EXISTING_ORGANIZATION]: RS_INITIAL_STATE,
  [EDIT_ORGANIZATION_DETAILS]: RS_INITIAL_STATE,
  [EDIT_ROLE_DETAILS]: RS_INITIAL_STATE,
  [GET_ALL_ORGANIZATIONS]: RS_INITIAL_STATE,
  [GET_ORGANIZATION]: RS_INITIAL_STATE,
  [GET_ORGANIZATION_INTEGRATION_DETAILS]: RS_INITIAL_STATE,
  [GET_ORGANIZATION_MEMBERS]: RS_INITIAL_STATE,
  [INITIALIZE_ORGANIZATION]: RS_INITIAL_STATE,
  [REMOVE_MEMBER_FROM_ORGANIZATION]: RS_INITIAL_STATE,
  [REMOVE_ROLE_FROM_MEMBER]: RS_INITIAL_STATE,
  [REMOVE_ROLE_FROM_ORGANIZATION]: RS_INITIAL_STATE,
  [RENAME_ORGANIZATION_DATABASE]: RS_INITIAL_STATE,
  // data
  [INTEGRATION_DETAILS]: Map(),
  [MEMBERS]: Map(),
  [NEW_ORGANIZATION_ID]: '',
  [ORGANIZATIONS]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATES: {
      return resetRequestStatesReducer(state, action);
    }

    case addMemberToOrganization.case(action.type): {
      return addMemberToOrganizationReducer(state, action);
    }

    case addMembersToOrganization.case(action.type): {
      return addMembersToOrganizationReducer(state, action);
    }

    case addRoleToMember.case(action.type): {
      return addRoleToMemberReducer(state, action);
    }

    case addRoleToOrganization.case(action.type): {
      return addRoleToOrganizationReducer(state, action);
    }

    case assignRolesToMembers.case(action.type): {
      return assignRolesToMembersReducer(state, action);
    }

    case createNewOrganization.case(action.type): {
      return createNewOrganizationReducer(state, action);
    }

    case deleteExistingOrganization.case(action.type): {
      return deleteExistingOrganizationReducer(state, action);
    }

    case editOrganizationDetails.case(action.type): {
      return editOrganizationDetailsReducer(state, action);
    }

    case editRoleDetails.case(action.type): {
      return editRoleDetailsReducer(state, action);
    }

    case getAllOrganizations.case(action.type): {
      return getAllOrganizationsReducer(state, action);
    }

    case getOrganization.case(action.type): {
      return getOrganizationReducer(state, action);
    }

    case getOrganizationIntegrationDetails.case(action.type): {
      return getOrganizationIntegrationDetailsReducer(state, action);
    }

    case getOrganizationMembers.case(action.type): {
      return getOrganizationMembersReducer(state, action);
    }

    case initializeOrganization.case(action.type): {
      return initializeOrganizationReducer(state, action);
    }

    case removeMemberFromOrganization.case(action.type): {
      return removeMemberFromOrganizationReducer(state, action);
    }

    case removeRoleFromMember.case(action.type): {
      return removeRoleFromMemberReducer(state, action);
    }

    case removeRoleFromOrganization.case(action.type): {
      return removeRoleFromOrganizationReducer(state, action);
    }

    case renameOrganizationDatabase.case(action.type): {
      return renameOrganizationDatabaseReducer(state, action);
    }

    default: {
      return state;
    }
  }
}
