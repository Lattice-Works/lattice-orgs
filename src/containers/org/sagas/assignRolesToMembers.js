/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery
} from '@redux-saga/core/effects';
import { Map } from 'immutable';
import { OrganizationsApiActions, OrganizationsApiSagas } from 'lattice-sagas';
import { LangUtils, Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Role, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { ASSIGN_ROLES_TO_MEMBERS, assignRolesToMembers } from '../actions';

const { isDefined } = LangUtils;

const { addRoleToMember } = OrganizationsApiActions;
const { addRoleToMemberWorker } = OrganizationsApiSagas;
const { isValidUUID } = ValidationUtils;

const LOG = new Logger('OrgsSagas');

function* assignRolesToMembersWorker(action :SequenceAction) :Saga<void> {

  try {
    yield put(assignRolesToMembers.request(action.id, action.value));

    const {
      organizationId,
      roles,
      members,
    } :{|
      organizationId :UUID;
      roles :Map<UUID, Role>;
      members :Map<string, Map>;
    |} = action.value;

    if (!isValidUUID(organizationId)) {
      throw new Error('organizationId must be a valid UUID');
    }

    const allRoleAssignments = [];
    members.forEach((member :Map, memberId :string) => {
      roles.forEach((role :Role, roleId :UUID) => {
        const assignment = call(addRoleToMemberWorker, addRoleToMember({
          memberId,
          organizationId,
          roleId,
        }));
        allRoleAssignments.push(assignment);
      });
    });

    const responses :WorkerResponse[] = yield all(allRoleAssignments);
    const responseError = responses.reduce(
      (error :any, r :Object) => (isDefined(error) ? error : r.error),
      undefined,
    );
    if (responseError) throw responseError;

    yield put(assignRolesToMembers.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(assignRolesToMembers.failure(action.id));
  }
  finally {
    yield put(assignRolesToMembers.finally(action.id));
  }
}

function* assignRolesToMembersWatcher() :Saga<void> {

  yield takeEvery(ASSIGN_ROLES_TO_MEMBERS, assignRolesToMembersWorker);
}

export {
  assignRolesToMembersWatcher,
  assignRolesToMembersWorker,
};
