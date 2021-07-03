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
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  EDIT_TITLE_DESCRIPTION_DATA_SCHEMA as DATA_SCHEMA,
  EDIT_TITLE_DESCRIPTION_UI_SCHEMA as UI_SCHEMA,
  ORGANIZATIONS,
} from '~/common/constants';
import { UpdateMetaModal } from '~/components';
import { selectMyKeys } from '~/core/redux/selectors';
import { Routes } from '~/core/router';

import DeleteOrgModal from './DeleteOrgModal';

import { EDIT_ORGANIZATION_DETAILS, editOrganizationDetails } from '../actions';

const CLOSE_DELETE = 'CLOSE_DELETE';
const CLOSE_DETAILS = 'CLOSE_DETAILS';
const CLOSE_MENU = 'CLOSE_MENU';
const OPEN_DELETE = 'OPEN_DELETE';
const OPEN_DETAILS = 'OPEN_DETAILS';
const OPEN_MENU = 'OPEN_MENU';

const INITIAL_STATE :{|
  deleteOpen :boolean;
  detailsOpen :boolean;
  menuOpen :boolean;
|} = {
  deleteOpen: false,
  detailsOpen: false,
  menuOpen: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case CLOSE_MENU:
      return {
        ...state,
        menuOpen: false,
      };
    case OPEN_MENU:
      return {
        ...state,
        menuOpen: true,
      };
    case CLOSE_DETAILS:
      return {
        ...state,
        detailsOpen: false,
      };
    case OPEN_DETAILS:
      return {
        ...state,
        detailsOpen: true,
        menuOpen: false,
      };
    case CLOSE_DELETE:
      return {
        ...state,
        deleteOpen: false,
      };
    case OPEN_DELETE:
      return {
        ...state,
        deleteOpen: true,
        menuOpen: false,
      };
    default:
      return state;
  }
};

const OrgActionButton = ({
  organization,
} :{|
  organization :Organization;
|}) => {

  const organizationId :UUID = (organization.id :any);
  const organizationName :string = (organization.title);

  const dispatch = useDispatch();

  const [state, stateDispatch] = useReducer(reducer, INITIAL_STATE);
  const [schema, setSchema] = useState({ dataSchema: DATA_SCHEMA, uiSchema: UI_SCHEMA });

  const editOrgRS :?RequestState = useRequestState([ORGANIZATIONS, EDIT_ORGANIZATION_DETAILS]);

  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());
  const isOwner :boolean = myKeys.has(List([organizationId]));
  const anchorRef = useRef(null);

  useEffect(() => {
    const dataSchema = JSON.parse(JSON.stringify(DATA_SCHEMA));
    dataSchema.properties.fields.properties.title.default = organization.title;
    dataSchema.properties.fields.properties.title.description = "Update this organization's title";
    dataSchema.properties.fields.properties.description.default = organization.description;
    dataSchema.properties.fields.properties.description.description = "Update this organization's description";
    setSchema({ dataSchema, uiSchema: UI_SCHEMA });
  }, [organization]);

  const goToManagePermissions = useGoToRoute(
    Routes.ORG_OBJECT_PERMISSIONS.replace(Routes.ORG_ID_PARAM, organizationId)
  );

  const goToSettings = useGoToRoute(
    Routes.ORG_SETTINGS.replace(Routes.ORG_ID_PARAM, organizationId)
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

  const handleOpenDelete = () => {
    stateDispatch({ type: OPEN_DELETE });
  };

  const handleCloseDelete = () => {
    stateDispatch({ type: CLOSE_DELETE });
  };

  const handleOnSubmitUpdate = ({ description, title }) => {
    dispatch(
      editOrganizationDetails({ description, organizationId, title })
    );
  };

  return (
    <>
      <IconButton
          aria-controls={state.menuOpen ? 'organization-action-menu' : undefined}
          aria-expanded={state.menuOpen ? 'true' : undefined}
          aria-haspopup="menu"
          aria-label="organization action button"
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
          id="organization-action-menu"
          onClose={handleCloseMenu}
          open={state.menuOpen}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top',
          }}>
        <MenuItem disabled={!isOwner} onClick={handleOpenDetails}>
          Edit Details
        </MenuItem>
        <MenuItem onClick={goToSettings}>
          Database Details
        </MenuItem>
        <MenuItem disabled={!isOwner} onClick={goToManagePermissions}>
          Manage Permissions
        </MenuItem>
        <MenuItem disabled={!isOwner} onClick={handleOpenDelete}>
          Delete Organization
        </MenuItem>
      </Menu>
      <UpdateMetaModal
          isVisible={state.detailsOpen}
          onClose={handleCloseDetails}
          onSubmit={handleOnSubmitUpdate}
          requestState={editOrgRS}
          requestStateAction={EDIT_ORGANIZATION_DETAILS}
          schema={schema} />
      <DeleteOrgModal
          isOwner={isOwner}
          isVisible={state.deleteOpen}
          onClose={handleCloseDelete}
          organizationId={organizationId}
          organizationName={organizationName} />
    </>
  );
};

export default OrgActionButton;
