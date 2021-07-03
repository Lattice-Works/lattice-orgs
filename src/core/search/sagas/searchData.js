/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { fromJS } from 'immutable';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { HITS, MAX_HITS_10, TOTAL_HITS } from '~/common/constants';

import { SEARCH_DATA, searchData } from '../actions';

const { searchEntitySetData } = SearchApiActions;
const { searchEntitySetDataWorker } = SearchApiSagas;
const { toSagaError } = AxiosUtils;

const LOG = new Logger('SearchSagas');

function* searchDataWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(searchData.request(action.id, action.value));

    const {
      entitySetId,
      maxHits = MAX_HITS_10,
      query,
      start = 0,
    } :{|
      entitySetId :UUID;
      maxHits :number;
      query :string;
      start :number;
    |} = action.value;

    const searchConstraints = {
      maxHits,
      start,
      constraints: [{
        constraints: [{
          searchTerm: query,
        }],
      }],
      entitySetIds: [entitySetId],
    };

    const response :WorkerResponse = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData(searchConstraints),
    );

    if (response.error) throw response.error;

    workerResponse = {
      data: {
        [HITS]: fromJS(response.data.hits || []),
        [TOTAL_HITS]: response.data.numHits || 0,
      },
    };

    yield put(searchData.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(searchData.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(searchData.finally(action.id));
  }

  return workerResponse;
}

function* searchDataWatcher() :Saga<*> {

  yield takeEvery(SEARCH_DATA, searchDataWorker);
}

export {
  searchDataWatcher,
  searchDataWorker,
};
