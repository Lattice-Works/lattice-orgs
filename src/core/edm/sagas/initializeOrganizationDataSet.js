/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { DataUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Organization, PropertyType, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { toSagaError } from '../../../utils';
import {
  ERR_MISSING_ORG,
  ERR_MISSING_PROPERTY_TYPE,
  ERR_UNEXPECTED_SEARCH_RESULTS,
} from '../../../utils/constants/errors';
import { DATA_SET, DATA_SET_COLUMNS, HITS } from '../../redux/constants';
import { selectOrganization, selectPropertyTypes } from '../../redux/selectors';
import { MAX_HITS_10000 } from '../../search/constants';
import { INITIALIZE_ORGANIZATION_DATA_SET, initializeOrganizationDataSet } from '../actions';
import { FQNS } from '../constants';

const { FQN } = Models;
const { searchEntitySetData } = SearchApiActions;
const { searchEntitySetDataWorker } = SearchApiSagas;
const { getPropertyValue } = DataUtils;

const REQUIRED_PROPERTY_TYPES :FQN[] = [
  FQNS.OL_DATA_SET_ID,
  FQNS.OL_ID,
];

const LOG = new Logger('EDMSagas');

function* initializeOrganizationDataSetWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(initializeOrganizationDataSet.request(action.id, action.value));

    const {
      dataSetId,
      organizationId,
    } :{|
      dataSetId :UUID;
      organizationId :UUID;
    |} = action.value;

    const organization :?Organization = yield select(selectOrganization(organizationId));
    if (!organization) {
      throw new Error(ERR_MISSING_ORG);
    }

    const propertyTypes :Map<UUID, PropertyType> = yield select(selectPropertyTypes(REQUIRED_PROPERTY_TYPES));
    const propertyTypeIds :Map<FQN, UUID> = propertyTypes.map((propertyType) => propertyType.type).flip();
    if (propertyTypeIds.count() !== REQUIRED_PROPERTY_TYPES.length) {
      throw new Error(ERR_MISSING_PROPERTY_TYPE);
    }

    const dataSetSearchResponse :WorkerResponse = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData({
        constraints: [{
          constraints: [{
            searchTerm: `entity.${propertyTypeIds.get(FQNS.OL_ID)}:${JSON.stringify(dataSetId)}`,
          }],
        }],
        entitySetIds: [organization.metadataEntitySetIds.datasets],
        maxHits: 1,
        start: 0,
      }),
    );
    if (dataSetSearchResponse.error) throw dataSetSearchResponse.error;

    if (dataSetSearchResponse.data[HITS].length > 1) {
      throw new Error(ERR_UNEXPECTED_SEARCH_RESULTS);
    }

    const dataSet :Map<FQN, List> = fromJS(dataSetSearchResponse.data[HITS][0]).mapKeys((key :string) => FQN.of(key));
    const dataSetName :string = getPropertyValue(dataSet, [FQNS.OL_DATA_SET_NAME, 0]);
    if (getPropertyValue(dataSet, [FQNS.OL_ID, 0]) !== dataSetId) {
      throw new Error(ERR_UNEXPECTED_SEARCH_RESULTS);
    }

    const dataSetColumnsSearchResponse :WorkerResponse = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData({
        constraints: [{
          constraints: [{
            fuzzy: false,
            searchTerm: `entity.${propertyTypeIds.get(FQNS.OL_DATA_SET_ID)}:${JSON.stringify(dataSetId)}`,
          }],
        }],
        entitySetIds: [organization.metadataEntitySetIds.columns],
        maxHits: MAX_HITS_10000,
        start: 0,
      }),
    );
    if (dataSetColumnsSearchResponse.error) throw dataSetColumnsSearchResponse.error;

    const dataSetColumns :List<Map<FQN, List>> = fromJS(dataSetColumnsSearchResponse.data[HITS])
      .map((column :Map) => column.mapKeys((key :string) => FQN.of(key)))
      // NOTE: just make sure the search results include columns ONLY for the data set we care about
      .filter((dataSetColumn :Map<FQN, List>) => (
        getPropertyValue(dataSetColumn, [FQNS.OL_DATA_SET_ID, 0]) === dataSetId
        && getPropertyValue(dataSetColumn, [FQNS.OL_DATA_SET_NAME, 0]) === dataSetName
      ));

    workerResponse = {
      data: {
        [DATA_SET]: dataSet,
        [DATA_SET_COLUMNS]: dataSetColumns,
      },
    };
    yield put(initializeOrganizationDataSet.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(initializeOrganizationDataSet.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(initializeOrganizationDataSet.finally(action.id));
  }

  return workerResponse;
}

function* initializeOrganizationDataSetWatcher() :Saga<*> {

  yield takeEvery(INITIALIZE_ORGANIZATION_DATA_SET, initializeOrganizationDataSetWorker);
}

export {
  initializeOrganizationDataSetWatcher,
  initializeOrganizationDataSetWorker,
};