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
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { ADD_MEMBERS_TO_ORGANIZATION, addMembersToOrganization } from '../actions';

const { isDefined } = LangUtils;

const { addMemberToOrganization, getOrganizationMembers } = OrganizationsApiActions;
const { addMemberToOrganizationWorker } = OrganizationsApiSagas;
const { isValidUUID } = ValidationUtils;

const LOG = new Logger('OrgsSagas');

function* addMembersToOrganizationWorker(action :SequenceAction) :Saga<void> {

  try {
    yield put(addMembersToOrganization.request(action.id, action.value));

    const {
      organizationId,
      members,
    } :{|
      organizationId :UUID;
      members :Map<string, Map>;
    |} = action.value;

    if (!isValidUUID(organizationId)) {
      throw new Error('organizationId must be a valid UUID');
    }

    const allAddMemberRequests = [];
    members.forEach((member :Map, memberId :string) => {
      const assignment = call(addMemberToOrganizationWorker, addMemberToOrganization({
        memberId,
        organizationId,
        profile: member,
      }));
      allAddMemberRequests.push(assignment);
    });

    const responses :WorkerResponse[] = yield all(allAddMemberRequests);
    const responseError = responses.reduce(
      (error :any, r :Object) => (isDefined(error) ? error : r.error),
      undefined,
    );
    if (responseError) throw responseError;

    yield put(addMembersToOrganization.success(action.id));
    yield put(getOrganizationMembers(organizationId));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(addMembersToOrganization.failure(action.id));
  }
  finally {
    yield put(addMembersToOrganization.finally(action.id));
  }
}

function* addMembersToOrganizationWatcher() :Saga<void> {

  yield takeEvery(ADD_MEMBERS_TO_ORGANIZATION, addMembersToOrganizationWorker);
}

export {
  addMembersToOrganizationWatcher,
  addMembersToOrganizationWorker,
};
