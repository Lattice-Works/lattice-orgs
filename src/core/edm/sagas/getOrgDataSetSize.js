/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Organization, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { ERR_MISSING_ORG } from '~/common/constants';
import { selectOrganization } from '~/core/redux/selectors';

import { GET_ORG_DATA_SET_SIZE, getOrgDataSetSize } from '../actions';

const { getEntitySetSize } = DataApiActions;
const { getEntitySetSizeWorker } = DataApiSagas;
const { toSagaError } = AxiosUtils;

const LOG = new Logger('EDMSagas');

function* getOrgDataSetSizeWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getOrgDataSetSize.request(action.id, action.value));

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

    const response :WorkerResponse = yield call(
      getEntitySetSizeWorker,
      getEntitySetSize(dataSetId),
    );
    if (response.error) throw response.error;
    workerResponse = response;

    yield put(getOrgDataSetSize.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(getOrgDataSetSize.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(getOrgDataSetSize.finally(action.id));
  }

  return workerResponse;
}

function* getOrgDataSetSizeWatcher() :Saga<*> {

  yield takeEvery(GET_ORG_DATA_SET_SIZE, getOrgDataSetSizeWorker);
}

export {
  getOrgDataSetSizeWatcher,
  getOrgDataSetSizeWorker,
};
