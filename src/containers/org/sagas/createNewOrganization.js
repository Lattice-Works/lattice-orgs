/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Models, Types } from 'lattice';
import { OrganizationsApiActions, OrganizationsApiSagas } from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { AxiosUtils } from '../../../utils';
import { CREATE_NEW_ORGANIZATION, createNewOrganization } from '../actions';

const { OrganizationBuilder, PrincipalBuilder } = Models;
const { PrincipalTypes } = Types;
const { createOrganization } = OrganizationsApiActions;
const { createOrganizationWorker } = OrganizationsApiSagas;

const LOG = new Logger('OrgSagas');

function* createNewOrganizationWorker(action :SequenceAction) :Saga<void> {

  try {
    yield put(createNewOrganization.request(action.id, action.value));

    const { description, title } = action.value;

    const principal = (new PrincipalBuilder())
      .setId(title.replace(/\W/g, ''))
      .setType(PrincipalTypes.ORGANIZATION)
      .build();

    const orgBuilder = (new OrganizationBuilder())
      .setDescription(description)
      .setPrincipal(principal)
      .setTitle(title);

    const response :WorkerResponse = yield call(
      createOrganizationWorker,
      createOrganization(orgBuilder.build()),
    );
    if (response.error) throw response.error;

    const org = orgBuilder
      .setId(response.data)
      .build();

    yield put(createNewOrganization.success(action.id, org));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(createNewOrganization.failure(action.id, AxiosUtils.toSagaError(error)));
  }
  finally {
    yield put(createNewOrganization.finally(action.id));
  }
}

function* createNewOrganizationWatcher() :Saga<*> {

  yield takeEvery(CREATE_NEW_ORGANIZATION, createNewOrganizationWorker);
}

export {
  createNewOrganizationWatcher,
  createNewOrganizationWorker,
};