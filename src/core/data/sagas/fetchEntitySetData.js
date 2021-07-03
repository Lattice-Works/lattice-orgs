/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Set } from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
} from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { selectStoredEntityKeyIds } from '~/core/redux/selectors';

import { FETCH_ENTITY_SET_DATA, fetchEntitySetData } from '../actions';

const LOG = new Logger('DataSagas');

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;

function* fetchEntitySetDataWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(fetchEntitySetData.request(action.id, action.value));

    const { entityKeyIds, entitySetId } :{
      entityKeyIds :Set<UUID>;
      entitySetId :UUID;
    } = action.value;

    // TODO: expire stored data
    const storedEntityKeyIds :Set<UUID> = yield select(selectStoredEntityKeyIds(entitySetId, entityKeyIds));
    const missingEntityKeyIds :Set<UUID> = entityKeyIds.subtract(storedEntityKeyIds);

    let entitySetData = {};
    if (!missingEntityKeyIds.isEmpty()) {
      const response :WorkerResponse = yield call(
        getEntitySetDataWorker,
        getEntitySetData({ entitySetId, entityKeyIds: missingEntityKeyIds.toJS() }),
      );
      if (response.error) throw response.error;
      entitySetData = response.data;
    }

    yield put(fetchEntitySetData.success(action.id, entitySetData));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(fetchEntitySetData.failure(action.id, error));
  }
  finally {
    yield put(fetchEntitySetData.finally(action.id));
  }
}

function* fetchEntitySetDataWatcher() :Saga<*> {

  yield takeEvery(FETCH_ENTITY_SET_DATA, fetchEntitySetDataWorker);
}

export {
  fetchEntitySetDataWatcher,
  fetchEntitySetDataWorker,
};
