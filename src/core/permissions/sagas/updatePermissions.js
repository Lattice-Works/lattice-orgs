/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { List } from 'immutable';
import { Models } from 'lattice';
import { PermissionsApiActions, PermissionsApiSagas } from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Ace, ActionType, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { UPDATE_PERMISSIONS, updatePermissions } from '../actions';

const { AclBuilder, AclDataBuilder } = Models;
const { updateAcls } = PermissionsApiActions;
const { updateAclsWorker } = PermissionsApiSagas;
const { toSagaError } = AxiosUtils;

const LOG = new Logger('PermissionsSagas');

function* updatePermissionsWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(updatePermissions.request(action.id, action.value));

    const permissionsUpdates :Array<{
      actionType :ActionType;
      permissions :Map<List<UUID>, Ace>;
    }> = action.value;

    const updates = [];
    permissionsUpdates.forEach(({ actionType, permissions }) => {
      permissions.forEach((ace :Ace, key :List<UUID>) => {
        const acl = (new AclBuilder())
          .setAces([ace])
          .setAclKey(key)
          .build();

        const aclData = (new AclDataBuilder())
          .setAcl(acl)
          .setAction(actionType)
          .build();

        updates.push(aclData);
      });
    });

    const response :WorkerResponse = yield call(updateAclsWorker, updateAcls(updates));
    if (response.error) throw response.error;

    workerResponse = { data: {} };
    yield put(updatePermissions.success(action.id));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(updatePermissions.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(updatePermissions.finally(action.id));
  }

  return workerResponse;
}

function* updatePermissionsWatcher() :Saga<*> {

  yield takeEvery(UPDATE_PERMISSIONS, updatePermissionsWorker);
}

export {
  updatePermissionsWatcher,
  updatePermissionsWorker,
};
