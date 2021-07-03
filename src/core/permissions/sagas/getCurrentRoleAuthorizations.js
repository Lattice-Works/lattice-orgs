/*
 * @flow
 */

import {
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { AuthorizationsApiActions, AuthorizationsApiSagas } from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import type { AuthorizationObject } from '~/common/types';

import { GET_CURRENT_ROLE_AUTHORIZATIONS, getCurrentRoleAuthorizations } from '../actions';

const { AccessCheck, AccessCheckBuilder } = Models;
const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;
const { toSagaError } = AxiosUtils;

const LOG = new Logger('PermissionsSagas');

function* getCurrentRoleAuthorizationsWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getCurrentRoleAuthorizations.request(action.id, action.value));
    const { aclKeys, permissions } = action.value;

    const accessChecks :AccessCheck[] = aclKeys.map((key :List<UUID>) => (
      (new AccessCheckBuilder())
        .setAclKey(key)
        .setPermissions(permissions)
        .build()
    )).toJS();

    const response :WorkerResponse = yield call(getAuthorizationsWorker, getAuthorizations(accessChecks));
    if (response.error) throw response.error;
    const authorizations :AuthorizationObject[] = response.data;
    const data = authorizations.map((authorization) => [authorization.aclKey, authorization.permissions]);

    workerResponse = {
      data: Map(fromJS(data))
    };

    yield put(getCurrentRoleAuthorizations.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(getCurrentRoleAuthorizations.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(getCurrentRoleAuthorizations.finally(action.id));
  }

  return workerResponse;
}

function* getCurrentRoleAuthorizationsWatcher() :Saga<*> {

  yield takeEvery(GET_CURRENT_ROLE_AUTHORIZATIONS, getCurrentRoleAuthorizationsWorker);
}

export {
  getCurrentRoleAuthorizationsWatcher,
  getCurrentRoleAuthorizationsWorker,
};
