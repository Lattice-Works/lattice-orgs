/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import {
  DataSetMetadataApiActions,
  DataSetsApiActions,
  EntitySetsApiActions,
  OrganizationsApiActions,
} from 'lattice-sagas';

import destroyTransportedOrganizationEntitySetReducer from './destroyTransportedOrganizationEntitySetReducer';
import getDataSetColumnsMetadataReducer from './getDataSetColumnsMetadataReducer';
import getDataSetMetadataReducer from './getDataSetMetadataReducer';
import getDataSetsMetadataReducer from './getDataSetsMetadataReducer';
import getEntityDataModelTypesReducer from './getEntityDataModelTypesReducer';
import getEntitySetReducer from './getEntitySetReducer';
import getEntitySetsReducer from './getEntitySetsReducer';
import getOrgDataSetSizeReducer from './getOrgDataSetSizeReducer';
import getOrganizationDataSetSchemaReducer from './getOrganizationDataSetSchemaReducer';
import getOrganizationDataSetsMetadataReducer from './getOrganizationDataSetsMetadataReducer';
import initializeOrganizationDataSetReducer from './initializeOrganizationDataSetReducer';
import isAppInstalledReducer from './isAppInstalledReducer';
import promoteStagingTableReducer from './promoteStagingTableReducer';
import transportOrganizationEntitySetReducer from './transportOrganizationEntitySetReducer';
import updateOrganizationDataSetReducer from './updateOrganizationDataSetReducer';

import {
  APP_INSTALLS,
  DATA_SET_SCHEMA,
  ENTITY_SETS,
  ENTITY_SETS_INDEX_MAP,
  ENTITY_SET_SIZE_MAP,
  ENTITY_TYPES,
  ENTITY_TYPES_INDEX_MAP,
  ORG_DATA_SETS,
  ORG_DATA_SET_COLUMNS,
  PROPERTY_TYPES,
  PROPERTY_TYPES_INDEX_MAP,
  RS_INITIAL_STATE,
} from '~/common/constants';
import { RESET_REQUEST_STATES } from '../../redux/actions';
import { resetRequestStatesReducer } from '../../redux/reducers';
import {
  GET_EDM_TYPES,
  GET_ORG_DATA_SET_SIZE,
  INITIALIZE_ORGANIZATION_DATA_SET,
  IS_APP_INSTALLED,
  UPDATE_ORGANIZATION_DATA_SET,
  getEntityDataModelTypes,
  getOrgDataSetSize,
  initializeOrganizationDataSet,
  isAppInstalled,
  updateOrganizationDataSet,
} from '../actions';

const {
  GET_DATA_SETS_METADATA,
  GET_DATA_SET_COLUMNS_METADATA,
  GET_DATA_SET_METADATA,
  GET_ORGANIZATION_DATA_SETS_METADATA,
  getDataSetColumnsMetadata,
  getDataSetMetadata,
  getDataSetsMetadata,
  getOrganizationDataSetsMetadata,
} = DataSetMetadataApiActions;

const {
  GET_ORGANIZATION_DATA_SET_SCHEMA,
  getOrganizationDataSetSchema,
} = DataSetsApiActions;

const {
  GET_ENTITY_SET,
  GET_ENTITY_SETS,
  getEntitySet,
  getEntitySets,
} = EntitySetsApiActions;

const {
  DESTROY_TRANSPORTED_ORGANIZATION_ENTITY_SET,
  PROMOTE_STAGING_TABLE,
  TRANSPORT_ORGANIZATION_ENTITY_SET,
  destroyTransportedOrganizationEntitySet,
  promoteStagingTable,
  transportOrganizationEntitySet,
} = OrganizationsApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [DESTROY_TRANSPORTED_ORGANIZATION_ENTITY_SET]: RS_INITIAL_STATE,
  [GET_DATA_SETS_METADATA]: RS_INITIAL_STATE,
  [GET_DATA_SET_COLUMNS_METADATA]: RS_INITIAL_STATE,
  [GET_DATA_SET_METADATA]: RS_INITIAL_STATE,
  [GET_EDM_TYPES]: RS_INITIAL_STATE,
  [GET_ENTITY_SETS]: RS_INITIAL_STATE,
  [GET_ENTITY_SET]: RS_INITIAL_STATE,
  [GET_ORGANIZATION_DATA_SETS_METADATA]: RS_INITIAL_STATE,
  [GET_ORGANIZATION_DATA_SET_SCHEMA]: RS_INITIAL_STATE,
  [GET_ORG_DATA_SET_SIZE]: RS_INITIAL_STATE,
  [INITIALIZE_ORGANIZATION_DATA_SET]: RS_INITIAL_STATE,
  [IS_APP_INSTALLED]: RS_INITIAL_STATE,
  [PROMOTE_STAGING_TABLE]: RS_INITIAL_STATE,
  [TRANSPORT_ORGANIZATION_ENTITY_SET]: RS_INITIAL_STATE,
  [UPDATE_ORGANIZATION_DATA_SET]: RS_INITIAL_STATE,
  // data
  [APP_INSTALLS]: Map(),
  [DATA_SET_SCHEMA]: Map(),
  [ENTITY_SET_SIZE_MAP]: Map(),
  [ENTITY_SETS]: List(),
  [ENTITY_SETS_INDEX_MAP]: Map(),
  [ENTITY_TYPES]: List(),
  [ENTITY_TYPES_INDEX_MAP]: Map(),
  [ORG_DATA_SETS]: Map(),
  [ORG_DATA_SET_COLUMNS]: Map(),
  [PROPERTY_TYPES]: List(),
  [PROPERTY_TYPES_INDEX_MAP]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATES: {
      return resetRequestStatesReducer(state, action);
    }

    case destroyTransportedOrganizationEntitySet.case(action.type): {
      return destroyTransportedOrganizationEntitySetReducer(state, action);
    }

    case getDataSetMetadata.case(action.type): {
      return getDataSetMetadataReducer(state, action);
    }

    case getDataSetsMetadata.case(action.type): {
      // TODO: merge with getOrganizationDataSetsMetadataReducer because SUCCESS case is exactly the same for both
      return getDataSetsMetadataReducer(state, action);
    }

    case getDataSetColumnsMetadata.case(action.type): {
      return getDataSetColumnsMetadataReducer(state, action);
    }

    case getEntityDataModelTypes.case(action.type): {
      return getEntityDataModelTypesReducer(state, action);
    }

    case getEntitySet.case(action.type): {
      return getEntitySetReducer(state, action);
    }

    case getEntitySets.case(action.type): {
      return getEntitySetsReducer(state, action);
    }

    case getOrgDataSetSize.case(action.type): {
      return getOrgDataSetSizeReducer(state, action);
    }

    case getOrganizationDataSetSchema.case(action.type): {
      return getOrganizationDataSetSchemaReducer(state, action);
    }

    case getOrganizationDataSetsMetadata.case(action.type): {
      return getOrganizationDataSetsMetadataReducer(state, action);
    }

    case initializeOrganizationDataSet.case(action.type): {
      return initializeOrganizationDataSetReducer(state, action);
    }

    case isAppInstalled.case(action.type): {
      return isAppInstalledReducer(state, action);
    }

    case promoteStagingTable.case(action.type): {
      return promoteStagingTableReducer(state, action);
    }

    case transportOrganizationEntitySet.case(action.type): {
      return transportOrganizationEntitySetReducer(state, action);
    }

    case updateOrganizationDataSet.case(action.type): {
      return updateOrganizationDataSetReducer(state, action);
    }

    default: {
      return state;
    }
  }
}
