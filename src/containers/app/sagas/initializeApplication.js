/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { OrganizationsApiActions, OrganizationsApiSagas } from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { getEntityDataModelTypes } from '~/core/edm/actions';
import { getEntityDataModelTypesWorker } from '~/core/edm/sagas';

import { INITIALIZE_APPLICATION, initializeApplication } from '../actions';

const { getAllOrganizations } = OrganizationsApiActions;
const { getAllOrganizationsWorker } = OrganizationsApiSagas;

const { toSagaError } = AxiosUtils;

const LOG = new Logger('AppSagas');

function* initializeApplicationWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(initializeApplication.request(action.id));
    const [edmResponse, orgsResponse] :WorkerResponse[] = yield all([
      call(getEntityDataModelTypesWorker, getEntityDataModelTypes()),
      call(getAllOrganizationsWorker, getAllOrganizations()),
    ]);
    if (edmResponse.error) throw edmResponse.error;
    if (orgsResponse.error) throw orgsResponse.error;

    yield put(initializeApplication.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(initializeApplication.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(initializeApplication.finally(action.id));
  }
}

function* initializeApplicationWatcher() :Saga<*> {

  yield takeEvery(INITIALIZE_APPLICATION, initializeApplicationWorker);
}

export {
  initializeApplicationWatcher,
  initializeApplicationWorker,
};
