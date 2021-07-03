/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { OrganizationsApiActions, OrganizationsApiSagas } from 'lattice-sagas';
import { Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Organization, Role, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { selectOrganization } from '~/core/redux/selectors';

import { REMOVE_ROLE_FROM_ORGANIZATION, removeRoleFromOrganization } from '../actions';

const { deleteRole } = OrganizationsApiActions;
const { deleteRoleWorker } = OrganizationsApiSagas;
const { isValidUUID } = ValidationUtils;

const LOG = new Logger('OrgsSagas');

function* removeRoleFromOrganizationWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(removeRoleFromOrganization.request(action.id, action.value));

    const {
      organizationId,
      roleId,
    } :{|
      organizationId :UUID;
      roleId :UUID;
    |} = action.value;

    if (!isValidUUID(organizationId)) {
      throw new Error('organizationId must be a valid UUID');
    }

    if (!isValidUUID(roleId)) {
      throw new Error('roleId must be a valid UUID');
    }

    const organization :?Organization = yield select(selectOrganization(organizationId));
    if (organization) {
      const roleIndex = organization.roles.findIndex((role :Role) => role.id === roleId);
      if (roleIndex === -1) {
        throw new Error(`role ${roleId} does not belong to organization ${organizationId}`);
      }
    }

    const response = yield call(deleteRoleWorker, deleteRole({ organizationId, roleId }));
    if (response.error) throw response.error;

    yield put(removeRoleFromOrganization.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(removeRoleFromOrganization.failure(action.id));
  }
  finally {
    yield put(removeRoleFromOrganization.finally(action.id));
  }
}

function* removeRoleFromOrganizationWatcher() :Saga<*> {

  yield takeEvery(REMOVE_ROLE_FROM_ORGANIZATION, removeRoleFromOrganizationWorker);
}

export {
  removeRoleFromOrganizationWatcher,
  removeRoleFromOrganizationWorker,
};
