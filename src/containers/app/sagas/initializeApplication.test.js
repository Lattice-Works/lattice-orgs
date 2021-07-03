/*
 * @flow
 */

import { all, call, put } from '@redux-saga/core/effects';
import { OrganizationsApiActions, OrganizationsApiSagas } from 'lattice-sagas';
import { v4 as uuid } from 'uuid';

import {
  GENERATOR_TAG,
  testShouldBeGeneratorFunction,
  testWatcherSagaShouldTakeEvery,
} from '~/common/testing/TestUtils';
import { GET_EDM_TYPES } from '~/core/edm/actions';
import { getEntityDataModelTypesWorker } from '~/core/edm/sagas';

import { initializeApplicationWatcher, initializeApplicationWorker } from './initializeApplication';

import { INITIALIZE_APPLICATION, initializeApplication } from '../actions';

const { GET_ALL_ORGANIZATIONS } = OrganizationsApiActions;
const { getAllOrganizationsWorker } = OrganizationsApiSagas;

const MOCK_RESPONSE = { data: true };

describe('AppSagas', () => {

  describe('initializeApplicationWatcher', () => {
    testShouldBeGeneratorFunction(initializeApplicationWatcher);
    testWatcherSagaShouldTakeEvery(
      initializeApplicationWatcher,
      initializeApplicationWorker,
      INITIALIZE_APPLICATION,
    );
  });

  describe('initializeApplicationWorker', () => {

    testShouldBeGeneratorFunction(initializeApplicationWorker);

    test('success case', () => {

      const mockActionValue = uuid();
      const workerSagaAction = initializeApplication(mockActionValue);
      const iterator = initializeApplicationWorker(workerSagaAction);
      expect(Object.prototype.toString.call(iterator)).toEqual(GENERATOR_TAG);

      let step = iterator.next();
      expect(step.value).toEqual(
        put({
          id: workerSagaAction.id,
          type: initializeApplication.REQUEST,
          value: {},
        })
      );

      step = iterator.next();
      expect(step.value).toEqual(
        all([
          call(getEntityDataModelTypesWorker, {
            // $FlowIgnore
            id: expect.any(String),
            type: GET_EDM_TYPES,
            value: {},
          }),
          call(getAllOrganizationsWorker, {
            // $FlowIgnore
            id: expect.any(String),
            type: GET_ALL_ORGANIZATIONS,
            value: {},
          }),
        ])
      );

      step = iterator.next([MOCK_RESPONSE, MOCK_RESPONSE]);
      expect(step.value).toEqual(
        put({
          id: workerSagaAction.id,
          type: initializeApplication.SUCCESS,
          value: {},
        })
      );

      step = iterator.next();
      expect(step.value).toEqual(
        put({
          id: workerSagaAction.id,
          type: initializeApplication.FINALLY,
          value: {},
        })
      );

      step = iterator.next();
      expect(step.done).toEqual(true);
    });

    test('failure case', () => {

      const mockActionValue = uuid();
      const workerSagaAction = initializeApplication(mockActionValue);
      const iterator = initializeApplicationWorker(workerSagaAction);
      expect(Object.prototype.toString.call(iterator)).toEqual(GENERATOR_TAG);

      let step = iterator.next();
      expect(step.value).toEqual(
        put({
          id: workerSagaAction.id,
          type: initializeApplication.REQUEST,
          value: {},
        })
      );

      step = iterator.throw(new Error('fail'));
      expect(step.value).toEqual(
        put({
          id: workerSagaAction.id,
          type: initializeApplication.FAILURE,
          value: {},
        })
      );

      step = iterator.next();
      expect(step.value).toEqual(
        put({
          id: workerSagaAction.id,
          type: initializeApplication.FINALLY,
          value: {},
        })
      );

      step = iterator.next();
      expect(step.done).toEqual(true);
    });

  });

});
