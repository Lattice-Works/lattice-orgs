/*
 * @flow
 */

import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Models, Types } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
  DataSetMetadataApiActions,
  DataSetMetadataApiSagas,
} from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { AccessCheck, Organization, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { DATA_SET_ID, ERR_MISSING_ORG, IS_OWNER } from '~/common/constants';
import { isEntitySet } from '~/common/utils';
import { selectOrganization } from '~/core/redux/selectors';

import { INITIALIZE_ORGANIZATION_DATA_SET, getOrgDataSetSize, initializeOrganizationDataSet } from '../actions';

const { AccessCheckBuilder } = Models;
const { PermissionTypes } = Types;
const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;
const { getDataSetMetadata, getDataSetColumnsMetadata } = DataSetMetadataApiActions;
const { getDataSetMetadataWorker, getDataSetColumnsMetadataWorker } = DataSetMetadataApiSagas;
const { toSagaError } = AxiosUtils;

const LOG = new Logger('EDMSagas');

function* initializeOrganizationDataSetWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(initializeOrganizationDataSet.request(action.id, action.value));

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

    const accessChecks :AccessCheck[] = [
      (new AccessCheckBuilder())
        .setAclKey([dataSetId])
        .setPermissions([PermissionTypes.OWNER])
        .build()
    ];

    const authorizationsCall = call(getAuthorizationsWorker, getAuthorizations(accessChecks));
    const dataSetCall = call(getDataSetMetadataWorker, getDataSetMetadata(dataSetId));
    const dataSetColumnsCall = call(getDataSetColumnsMetadataWorker, getDataSetColumnsMetadata([dataSetId]));

    const [
      authorizationsResponse,
      dataSetResponse,
      dataSetColumnsResponse,
    ] :WorkerResponse[] = yield all([authorizationsCall, dataSetCall, dataSetColumnsCall]);

    if (dataSetResponse.error) throw dataSetResponse.error;
    if (dataSetColumnsResponse.error) throw dataSetColumnsResponse.error;

    if (isEntitySet(dataSetResponse.data)) {
      yield put(getOrgDataSetSize({ dataSetId, organizationId }));
    }

    let isOwner :boolean = false;
    if (!authorizationsResponse.error) {
      isOwner = authorizationsResponse.data[0].permissions[PermissionTypes.OWNER] === true;
    }

    yield put(initializeOrganizationDataSet.success(action.id, {
      [DATA_SET_ID]: dataSetId,
      [IS_OWNER]: isOwner,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(initializeOrganizationDataSet.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(initializeOrganizationDataSet.finally(action.id));
  }
}

function* initializeOrganizationDataSetWatcher() :Saga<*> {

  yield takeEvery(INITIALIZE_ORGANIZATION_DATA_SET, initializeOrganizationDataSetWorker);
}

export {
  initializeOrganizationDataSetWatcher,
  initializeOrganizationDataSetWorker,
};
