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
import { List, Map } from 'immutable';
import { Types } from 'lattice';
import { DataSetsApiActions } from 'lattice-sagas';
import { IconButton, Menu, MenuItem } from 'lattice-ui-kit';
import { useGoToRoute, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  DESCRIPTION,
  EDIT_TITLE_DESCRIPTION_DATA_SCHEMA as DATA_SCHEMA,
  EDIT_TITLE_DESCRIPTION_UI_SCHEMA as UI_SCHEMA,
  EDM,
  FLAGS,
  METADATA,
  NAME,
  OPENLATTICE,
  TITLE,
} from '~/common/constants';
import { isEntitySet } from '~/common/utils';
import { UpdateMetaModal } from '~/components';
import { UPDATE_ORGANIZATION_DATA_SET, updateOrganizationDataSet } from '~/core/edm/actions';
import {
  selectCurrentAuthorization,
  selectDataSetSchema,
  selectMyKeys,
  selectOrgDataSet,
} from '~/core/redux/selectors';
import { Routes } from '~/core/router';

import AssembleMenuItem from './AssembleMenuItem';
import PromoteTableModal from './PromoteTableModal';

const { getOrganizationDataSetSchema } = DataSetsApiActions;
const { EntitySetFlagTypes, PermissionTypes } = Types;

const CLOSE_DETAILS = 'CLOSE_DETAILS';
const CLOSE_MENU = 'CLOSE_MENU';
const CLOSE_PROMOTE_DIALOG = 'CLOSE_PROMOTE_DIALOG';
const OPEN_DETAILS = 'OPEN_DETAILS';
const OPEN_MENU = 'OPEN_MENU';
const OPEN_PROMOTE_DIALOG = 'OPEN_PROMOTE_DIALOG';

const INITIAL_STATE = {
  detailsOpen: false,
  menuOpen: false,
  promoteOpen: false,
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
    case CLOSE_PROMOTE_DIALOG:
      return {
        ...state,
        promoteOpen: false,
      };
    case OPEN_PROMOTE_DIALOG:
      return {
        ...state,
        menuOpen: false,
        promoteOpen: true,
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
    default:
      return state;
  }
};

const DataSetActionButton = ({
  dataSetId,
  organizationId,
} :{|
  dataSetId :UUID;
  organizationId :UUID;
|}) => {

  const dataSetKey :List<UUID> = List([dataSetId]);

  const dispatch = useDispatch();

  const [state, stateDispatch] = useReducer(reducer, INITIAL_STATE);
  const [schema, setSchema] = useState({ dataSchema: DATA_SCHEMA, uiSchema: UI_SCHEMA });

  const updateOrgDataSetRS :?RequestState = useRequestState([EDM, UPDATE_ORGANIZATION_DATA_SET]);

  const hasMaterialize :boolean = useSelector(selectCurrentAuthorization(dataSetKey, PermissionTypes.MATERIALIZE));
  const dataSetSchema = useSelector(selectDataSetSchema(dataSetId));

  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());
  const isDataSetOwner :boolean = myKeys.has(dataSetKey);
  const isOrgOwner :boolean = myKeys.has(List([organizationId]));

  const dataSet :Map = useSelector(selectOrgDataSet(organizationId, dataSetId));
  const dataSetDescription :string = dataSet.getIn([METADATA, DESCRIPTION]);
  const dataSetFlags :List<string> = dataSet.getIn([METADATA, FLAGS]);
  const dataSetName :string = dataSet.get(NAME);
  const dataSetTitle :string = dataSet.getIn([METADATA, TITLE]);
  const isAtlas :boolean = !isEntitySet(dataSet);
  const isAssembled = isAtlas ? false : dataSetFlags.includes(EntitySetFlagTypes.TRANSPORTED);
  const isPromoted = dataSetSchema === OPENLATTICE;

  useEffect(() => {
    if (isAtlas) {
      dispatch(getOrganizationDataSetSchema({
        dataSetId,
        organizationId,
      }));
    }
  }, [
    dataSetId,
    dispatch,
    isAtlas,
    organizationId,
  ]);

  useEffect(() => {
    const dataSchema = JSON.parse(JSON.stringify(DATA_SCHEMA));
    dataSchema.properties.fields.properties.title.default = dataSetTitle;
    dataSchema.properties.fields.properties.title.description = "Update this data set's title";
    dataSchema.properties.fields.properties.description.default = dataSetDescription;
    dataSchema.properties.fields.properties.description.description = "Update this data set's description";
    setSchema({ dataSchema, uiSchema: UI_SCHEMA });
  }, [dataSetDescription, dataSetTitle]);

  const goToManagePermissions = useGoToRoute(
    Routes.ORG_DATA_SET_OBJECT_PERMISSIONS
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.DATA_SET_ID_PARAM, dataSetId)
  );

  const anchorRef = useRef(null);

  const handleOpenMenu = () => {
    stateDispatch({ type: OPEN_MENU });
  };

  const handleCloseMenu = () => {
    stateDispatch({ type: CLOSE_MENU });
  };

  const handleOpenPromote = () => {
    stateDispatch({ type: OPEN_PROMOTE_DIALOG });
  };

  const handleClosePromote = () => {
    stateDispatch({ type: CLOSE_PROMOTE_DIALOG });
  };

  const handleOpenDetails = () => {
    stateDispatch({ type: OPEN_DETAILS });
  };

  const handleCloseDetails = () => {
    stateDispatch({ type: CLOSE_DETAILS });
  };

  const handleOnSubmitUpdate = ({ description, title }) => {
    dispatch(
      updateOrganizationDataSet({
        dataSetId,
        description,
        organizationId,
        title,
      })
    );
  };

  return (
    <>
      <IconButton
          aria-controls={state.menuOpen ? 'dataset-action-menu' : undefined}
          aria-expanded={state.menuOpen ? 'true' : undefined}
          aria-haspopup="menu"
          aria-label="dataset action button"
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
          id="dataset-action-menu"
          onClose={handleCloseMenu}
          open={state.menuOpen}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top',
          }}>
        <MenuItem disabled={!isDataSetOwner} onClick={handleOpenDetails}>
          Edit Details
        </MenuItem>
        {
          isAtlas && (
            <MenuItem disabled={!isOrgOwner || isPromoted} onClick={handleOpenPromote}>
              {
                isPromoted
                  ? 'Promoted'
                  : 'Promote Data Set'
              }
            </MenuItem>
          )
        }
        {
          !isAtlas && (
            <AssembleMenuItem
                disabled={!hasMaterialize || isAtlas}
                entitySetId={dataSetId}
                isAssembled={isAssembled}
                organizationId={organizationId} />
          )
        }
        {
          isDataSetOwner && (
            <MenuItem onClick={goToManagePermissions}>
              Manage Permissions
            </MenuItem>
          )
        }
      </Menu>
      <PromoteTableModal
          dataSetId={dataSetId}
          dataSetName={dataSetName}
          isVisible={state.promoteOpen}
          onClose={handleClosePromote}
          organizationId={organizationId} />
      <UpdateMetaModal
          isVisible={state.detailsOpen}
          onClose={handleCloseDetails}
          onSubmit={handleOnSubmitUpdate}
          requestState={updateOrgDataSetRS}
          requestStateAction={UPDATE_ORGANIZATION_DATA_SET}
          schema={schema} />
    </>
  );
};

export default DataSetActionButton;
