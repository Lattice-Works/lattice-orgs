/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Set } from 'immutable';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { SEARCH_DATA_SETS, searchDataSets } from '../actions';
import { MAX_HITS_20 } from '../constants';
import type { SearchEntitySetsHit } from '../../../types';

const LOG = new Logger('SearchSagas');

const { searchEntitySetMetaData } = SearchApiActions;
const { searchEntitySetMetaDataWorker } = SearchApiSagas;

function* searchDataSetsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(searchDataSets.request(action.id, action.value));

    const {
      query,
      maxHits = MAX_HITS_20,
      start = 0,
    } :{|
      maxHits :number;
      query :string;
      start :number;
    |} = action.value;

    // TODO: search atlas data sets as well
    const response :WorkerResponse = yield call(
      searchEntitySetMetaDataWorker,
      searchEntitySetMetaData({
        maxHits,
        start,
        searchTerm: query,
      }),
    );

    if (response.error) throw response.error;

    const hits = response.data.hits || [];
    const totalHits = response.data.numHits || 0;

    const entitySetIds :Set<UUID> = Set().withMutations((mutableSet) => {
      hits.forEach((hit :SearchEntitySetsHit) => mutableSet.add(hit.entitySet.id));
    });

    yield put(searchDataSets.success(action.id, {
      totalHits,
      hits: entitySetIds,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchDataSets.failure(action.id, error));
  }
  finally {
    yield put(searchDataSets.finally(action.id));
  }
}

function* searchDataSetsWatcher() :Saga<*> {

  yield takeEvery(SEARCH_DATA_SETS, searchDataSetsWorker);
}

export {
  searchDataSetsWatcher,
  searchDataSetsWorker,
};