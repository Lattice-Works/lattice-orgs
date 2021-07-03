/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { Models, Types } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
  OrganizationsApiActions,
  OrganizationsApiSagas,
} from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { APPS, IS_OWNER, ORGANIZATION_ID } from '~/common/constants';
import { isAppInstalled } from '~/core/edm/actions';
import { isAppInstalledWorker } from '~/core/edm/sagas';
import type { AuthorizationObject } from '~/common/types';

import { INITIALIZE_ORGANIZATION, initializeOrganization } from '../actions';

const { AccessCheck, AccessCheckBuilder } = Models;
const { PermissionTypes } = Types;

const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;
const {
  getOrganization,
  getOrganizationMembers,
} = OrganizationsApiActions;
const {
  getOrganizationMembersWorker,
  getOrganizationWorker,
} = OrganizationsApiSagas;
const { toSagaError } = AxiosUtils;

const LOG = new Logger('OrgsSagas');

function* initializeOrganizationWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(initializeOrganization.request(action.id, action.value));

    const organizationId :UUID = action.value;

    const getOrganizationCall = call(getOrganizationWorker, getOrganization(organizationId));
    const getOrganizationMembersCall = call(getOrganizationMembersWorker, getOrganizationMembers(organizationId));

    const accessChecks :AccessCheck[] = [
      (new AccessCheckBuilder())
        .setAclKey([organizationId])
        .setPermissions([PermissionTypes.OWNER])
        .build()
    ];
    const getAuthorizationsCall = call(getAuthorizationsWorker, getAuthorizations(accessChecks));

    const isAppInstalledCall = call(
      isAppInstalledWorker,
      isAppInstalled({ appName: APPS.ACCESS_REQUESTS, organizationId }),
    );

    const [
      getOrganizationResponse,
      getOrganizationMembersResponse,
      getAuthorizationsResponse,
    ] :Array<WorkerResponse> = yield all([
      getOrganizationCall,
      getOrganizationMembersCall,
      getAuthorizationsCall,
      isAppInstalledCall,
    ]);

    if (getOrganizationResponse.error) throw getOrganizationResponse.error;
    if (getOrganizationMembersResponse.error) throw getOrganizationMembersResponse.error;
    if (getAuthorizationsResponse.error) throw getAuthorizationsResponse.error;

    const authorizations :AuthorizationObject[] = getAuthorizationsResponse.data;
    const isOwner = authorizations[0].permissions[PermissionTypes.OWNER] === true;

    yield put(initializeOrganization.success(action.id, {
      [IS_OWNER]: isOwner,
      [ORGANIZATION_ID]: organizationId,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(initializeOrganization.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(initializeOrganization.finally(action.id));
  }
}

function* initializeOrganizationWatcher() :Saga<*> {

  yield takeEvery(INITIALIZE_ORGANIZATION, initializeOrganizationWorker);
}

export {
  initializeOrganizationWatcher,
  initializeOrganizationWorker,
};
