/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { List } from 'immutable';
import { Models } from 'lattice';
import { PermissionsApiActions, PermissionsApiSagas } from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type {
  Ace,
  ActionType,
  UUID,
} from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { UPDATE_PERMISSIONS, updatePermissions } from '../actions';

const LOG = new Logger('PermissionsSagas');

const { AclBuilder, AclDataBuilder } = Models;
const { updateAcls } = PermissionsApiActions;
const { updateAclsWorker } = PermissionsApiSagas;

function* updatePermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(updatePermissions.request(action.id, action.value));

    const {
      actionType,
      permissions,
    } :{
      actionType :ActionType;
      permissions :Map<List<UUID>, Ace>;
    } = action.value;

    const updates = [];
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

    const response :WorkerResponse = yield call(updateAclsWorker, updateAcls(updates));
    if (response.error) throw response.error;

    yield put(updatePermissions.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(updatePermissions.failure(action.id, error));
  }
  finally {
    yield put(updatePermissions.finally(action.id));
  }
}

function* updatePermissionsWatcher() :Saga<*> {

  yield takeEvery(UPDATE_PERMISSIONS, updatePermissionsWorker);
}

export {
  updatePermissionsWatcher,
  updatePermissionsWorker,
};