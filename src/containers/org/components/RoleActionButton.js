/*
 * @flow
 */

import React, {
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';

import { faEllipsisV } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Set } from 'immutable';
import { IconButton, Menu, MenuItem } from 'lattice-ui-kit';
import { useGoToRoute, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, Role, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  EDIT_TITLE_DESCRIPTION_DATA_SCHEMA as DATA_SCHEMA,
  EDIT_TITLE_DESCRIPTION_UI_SCHEMA as UI_SCHEMA,
  ORGANIZATIONS,
} from '~/common/constants';
import { UpdateMetaModal } from '~/components';
import { selectMyKeys } from '~/core/redux/selectors';
import { Routes } from '~/core/router';

import RemoveRoleFromOrgModal from './RemoveRoleFromOrgModal';

import { EDIT_ROLE_DETAILS, editRoleDetails } from '../actions';

const CLOSE_DETAILS = 'CLOSE_DETAILS';
const CLOSE_MENU = 'CLOSE_MENU';
const CLOSE_REMOVE_ROLE = 'CLOSE_REMOVE_ROLE';
const OPEN_DETAILS = 'OPEN_DETAILS';
const OPEN_MENU = 'OPEN_MENU';
const OPEN_REMOVE_ROLE = 'OPEN_REMOVE_ROLE';

const INITIAL_STATE = {
  detailsOpen: false,
  descriptionOpen: false,
  menuOpen: false,
  removeRoleOpen: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case CLOSE_DETAILS:
      return {
        ...state,
        detailsOpen: false,
      };
    case CLOSE_MENU:
      return {
        ...state,
        menuOpen: false,
      };
    case CLOSE_REMOVE_ROLE:
      return {
        ...state,
        removeRoleOpen: false,
      };
    case OPEN_DETAILS:
      return {
        ...state,
        menuOpen: false,
        detailsOpen: true,
      };
    case OPEN_MENU:
      return {
        ...state,
        menuOpen: true,
      };
    case OPEN_REMOVE_ROLE:
      return {
        ...state,
        menuOpen: false,
        removeRoleOpen: true,
      };
    default:
      return state;
  }
};

const RoleActionButton = ({
  organization,
  role,
} :{|
  organization :Organization;
  role :Role;
|}) => {

  const organizationId :UUID = (organization.id :any);
  const roleId :UUID = (role.id :any);

  const dispatch = useDispatch();

  const [state, stateDispatch] = useReducer(reducer, INITIAL_STATE);
  const [schema, setSchema] = useState({ dataSchema: DATA_SCHEMA, uiSchema: UI_SCHEMA });

  const editRoleRS :?RequestState = useRequestState([ORGANIZATIONS, EDIT_ROLE_DETAILS]);

  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());
  const isOwner :boolean = myKeys.has(List([organizationId]));
  const anchorRef = useRef(null);

  useEffect(() => {
    const dataSchema = JSON.parse(JSON.stringify(DATA_SCHEMA));
    dataSchema.properties.fields.properties.title.default = role.title;
    dataSchema.properties.fields.properties.title.description = "Update this role's title";
    dataSchema.properties.fields.properties.description.default = role.description;
    dataSchema.properties.fields.properties.description.description = "Update this role's description";
    setSchema({ dataSchema, uiSchema: UI_SCHEMA });
  }, [role]);

  const goToManagePermissions = useGoToRoute(
    Routes.ORG_ROLE_OBJECT_PERMISSIONS
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.ROLE_ID_PARAM, roleId)
  );

  const handleOpenMenu = () => {
    stateDispatch({ type: OPEN_MENU });
  };

  const handleCloseMenu = () => {
    stateDispatch({ type: CLOSE_MENU });
  };

  const handleOpenDetails = () => {
    stateDispatch({ type: OPEN_DETAILS });
  };

  const handleCloseDetails = () => {
    stateDispatch({ type: CLOSE_DETAILS });
  };

  const handleOpenRemoveRole = () => {
    stateDispatch({ type: OPEN_REMOVE_ROLE });
  };

  const handleCloseRemoveRole = () => {
    stateDispatch({ type: CLOSE_REMOVE_ROLE });
  };

  const handleOnSubmitUpdate = ({ description, title }) => {
    dispatch(
      editRoleDetails({
        description,
        organizationId,
        roleId,
        title,
      })
    );
  };

  return (
    <>
      <IconButton
          aria-controls={state.menuOpen ? 'role-action-menu' : undefined}
          aria-expanded={state.menuOpen ? 'true' : undefined}
          aria-haspopup="menu"
          aria-label="role action button"
          onClick={handleOpenMenu}
          ref={anchorRef}
          variant="text">
        <FontAwesomeIcon fixedWidth icon={faEllipsisV} />
      </IconButton>
      <Menu
          anchorEl={anchorRef.current}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom',
          }}
          elevation={4}
          getContentAnchorEl={null}
          id="role-action-menu"
          onClose={handleCloseMenu}
          open={state.menuOpen}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top',
          }}>
        <MenuItem disabled={!isOwner} onClick={handleOpenDetails}>
          Edit Details
        </MenuItem>
        <MenuItem disabled={!isOwner} onClick={handleOpenRemoveRole}>
          Delete Role
        </MenuItem>
        <MenuItem disabled={!isOwner} onClick={goToManagePermissions}>
          Manage Permissions
        </MenuItem>
      </Menu>
      <UpdateMetaModal
          isVisible={state.detailsOpen}
          onClose={handleCloseDetails}
          onSubmit={handleOnSubmitUpdate}
          requestState={editRoleRS}
          requestStateAction={EDIT_ROLE_DETAILS}
          schema={schema} />
      <RemoveRoleFromOrgModal
          isVisible={state.removeRoleOpen}
          onClose={handleCloseRemoveRole}
          organizationId={organizationId}
          roleId={roleId} />
    </>
  );
};

export default RoleActionButton;
