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
import { Models, Types } from 'lattice';
import {
  DataSetMetadataApiActions,
  DataSetMetadataApiSagas,
  PermissionsApiActions,
  PermissionsApiSagas,
} from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { PermissionType, Principal, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { getDataSetKeys } from '~/common/utils';
import { selectOrgDataSet, selectOrgDataSetColumns } from '~/core/redux/selectors';

import { ASSIGN_PERMISSIONS_TO_DATA_SET, assignPermissionsToDataSet } from '../actions';

const { AceBuilder, AclBuilder, AclDataBuilder } = Models;
const { ActionTypes } = Types;
const { getDataSetColumnsMetadata } = DataSetMetadataApiActions;
const { getDataSetColumnsMetadataWorker } = DataSetMetadataApiSagas;
const { updateAcls } = PermissionsApiActions;
const { updateAclsWorker } = PermissionsApiSagas;
const { toSagaError } = AxiosUtils;

const LOG = new Logger('PermissionsSagas');

function* assignPermissionsToDataSetWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(assignPermissionsToDataSet.request(action.id, action.value));

    const {
      dataSetId,
      organizationId,
      permissionTypes,
      principal,
      withColumns = false,
    } :{|
      dataSetId :UUID;
      organizationId :UUID;
      permissionTypes :PermissionType[];
      principal :Principal;
      withColumns ?:boolean;
    |} = action.value;

    let response :WorkerResponse;

    let keys :List<List<UUID>> = List().push(List([dataSetId]));
    if (withColumns) {
      const dataSet :Map = yield select(selectOrgDataSet(organizationId, dataSetId));
      let dataSetColumns :Map<UUID, Map> = yield select(selectOrgDataSetColumns(organizationId, dataSetId));
      // NOTE: if "dataSetColumns" is empty, it's very likely that we just haven't loaded columns
      if (dataSetColumns.isEmpty()) {
        response = yield call(getDataSetColumnsMetadataWorker, getDataSetColumnsMetadata([dataSetId]));
        if (response.error) throw response.error;
        dataSetColumns = response.data.get(dataSetId) || List();
      }
      keys = getDataSetKeys(dataSet, dataSetColumns);
    }

    const updates = [];
    const permissions = Map().withMutations((mutableMap) => {
      keys.forEach((key :List<UUID>) => {

        const ace = (new AceBuilder())
          .setPermissions(permissionTypes)
          .setPrincipal(principal)
          .build();

        const acl = (new AclBuilder())
          .setAces([ace])
          .setAclKey(key)
          .build();

        const aclData = (new AclDataBuilder())
          .setAcl(acl)
          .setAction(ActionTypes.ADD)
          .build();

        mutableMap.set(key, ace);
        updates.push(aclData);
      });
    });

    response = yield call(updateAclsWorker, updateAcls(updates));
    if (response.error) throw response.error;

    yield put(assignPermissionsToDataSet.success(action.id, { permissions }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(assignPermissionsToDataSet.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(assignPermissionsToDataSet.finally(action.id));
  }
}

function* assignPermissionsToDataSetWatcher() :Saga<*> {

  yield takeEvery(ASSIGN_PERMISSIONS_TO_DATA_SET, assignPermissionsToDataSetWorker);
}

export {
  assignPermissionsToDataSetWatcher,
  assignPermissionsToDataSetWorker,
};
