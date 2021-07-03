/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { DataSetMetadataApiActions, DataSetMetadataApiSagas } from 'lattice-sagas';
import { AxiosUtils, Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Organization, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { ERR_MISSING_ORG } from '~/common/constants';
import { selectOrganization } from '~/core/redux/selectors';

import { UPDATE_ORGANIZATION_DATA_SET, updateOrganizationDataSet } from '../actions';

const { updateDataSetMetadata, updateDataSetColumnMetadata } = DataSetMetadataApiActions;
const { updateDataSetMetadataWorker, updateDataSetColumnMetadataWorker } = DataSetMetadataApiSagas;
const { toSagaError } = AxiosUtils;
const { isValidUUID } = ValidationUtils;

const LOG = new Logger('EDMSagas');

function* updateOrganizationDataSetWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(updateOrganizationDataSet.request(action.id, action.value));

    const {
      columnId,
      dataSetId,
      description,
      organizationId,
      title,
    } :{|
      columnId ?:UUID;
      dataSetId :UUID;
      description :string;
      organizationId :UUID;
      title :string;
    |} = action.value;

    const organization :?Organization = yield select(selectOrganization(organizationId));
    if (!organization) {
      throw new Error(ERR_MISSING_ORG);
    }

    const metadata = { description, title };
    const updateCall = isValidUUID(columnId)
      ? call(updateDataSetColumnMetadataWorker, updateDataSetColumnMetadata({ columnId, dataSetId, metadata }))
      : call(updateDataSetMetadataWorker, updateDataSetMetadata({ dataSetId, metadata }));

    const response :WorkerResponse = yield updateCall;
    if (response.error) throw response.error;

    yield put(updateOrganizationDataSet.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(updateOrganizationDataSet.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(updateOrganizationDataSet.finally(action.id));
  }
}

function* updateOrganizationDataSetWatcher() :Saga<*> {

  yield takeEvery(UPDATE_ORGANIZATION_DATA_SET, updateOrganizationDataSetWorker);
}

export {
  updateOrganizationDataSetWatcher,
  updateOrganizationDataSetWorker,
};
