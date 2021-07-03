/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map } from 'immutable';
import { Types } from 'lattice';
import { PrincipalsApiActions, PrincipalsApiSagas } from 'lattice-sagas';
import { AxiosUtils, Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Ace, Principal, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { ERR_INVALID_UUID } from '~/common/constants';
import { getDataSetKeys } from '~/common/utils';
import { selectOrgDataSet, selectOrgDataSetColumns, selectPermissionsByPrincipal } from '~/core/redux/selectors';

import { getPermissionsWorker } from './getPermissions';

import { INITIALIZE_OBJECT_PERMISSIONS, getPermissions, initializeObjectPermissions } from '../actions';

const { PrincipalTypes } = Types;
const { getUsers } = PrincipalsApiActions;
const { getUsersWorker } = PrincipalsApiSagas;
const { toSagaError } = AxiosUtils;
const { isValidUUID } = ValidationUtils;

const LOG = new Logger('PermissionsSagas');

function* initializeObjectPermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(initializeObjectPermissions.request(action.id, action.value));

    const {
      isDataSet,
      objectKey,
      organizationId,
    } :{
      isDataSet :boolean;
      objectKey :List<UUID>;
      organizationId :UUID;
    } = action.value;

    if (!objectKey.every(isValidUUID) || !isValidUUID(organizationId)) {
      throw new Error(ERR_INVALID_UUID);
    }

    let response :WorkerResponse;
    let keys :List<List<UUID>> = List();

    if (isDataSet) {
      const dataSetId :UUID = objectKey.get(0);
      const dataSet :Map = yield select(selectOrgDataSet(organizationId, dataSetId));
      const dataSetColumns :Map<UUID, Map> = yield select(selectOrgDataSetColumns(organizationId, dataSetId));
      keys = getDataSetKeys(dataSet, dataSetColumns);
      response = yield call(getPermissionsWorker, getPermissions(keys));
      if (response.error) throw response.error;
    }
    else {
      keys = List().push(objectKey);
      response = yield call(getPermissionsWorker, getPermissions(keys));
      if (response.error) throw response.error;
    }

    const permissions :Map<Principal, Map<List<UUID>, Ace>> = yield select(selectPermissionsByPrincipal(keys));

    const userIds :string[] = permissions.keySeq()
      .filter((principal :Principal) => principal.type === PrincipalTypes.USER)
      .map((principal :Principal) => principal.id)
      .toJS();

    if (userIds.length !== 0) {
      // NOTE: not sure if we should throw if this fails... the fallback is to show the principal id
      yield call(getUsersWorker, getUsers(userIds));
    }

    yield put(initializeObjectPermissions.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(initializeObjectPermissions.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(initializeObjectPermissions.finally(action.id));
  }
}

function* initializeObjectPermissionsWatcher() :Saga<*> {

  yield takeEvery(
    INITIALIZE_OBJECT_PERMISSIONS,
    initializeObjectPermissionsWorker,
  );
}

export {
  initializeObjectPermissionsWatcher,
  initializeObjectPermissionsWorker,
};
