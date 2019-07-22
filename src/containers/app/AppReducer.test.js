import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';

import reducer from './AppReducer';
import {
  INITIALIZE_APPLICATION,
  initializeApplication,
} from './AppActions';

const MOCK_APP_NAME = 'TestApp';
const MOCK_ERR_STATUS = 500;
const MOCK_ERR_RESPONSE = {
  response: {
    status: MOCK_ERR_STATUS,
  },
};

describe('AppReducer', () => {

  const INITIAL_STATE = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Map);
    expect(INITIAL_STATE.getIn([INITIALIZE_APPLICATION, 'requestState'])).toEqual(RequestStates.STANDBY);
  });

  describe(INITIALIZE_APPLICATION, () => {

    test(initializeApplication.REQUEST, () => {

      const { id } = initializeApplication();
      const state = reducer(INITIAL_STATE, initializeApplication.request(id, MOCK_APP_NAME));

      expect(state.getIn([INITIALIZE_APPLICATION, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(state.getIn([INITIALIZE_APPLICATION, id]))
        .toEqual({
          id,
          type: initializeApplication.REQUEST,
          value: MOCK_APP_NAME,
        });
    });

    test(initializeApplication.SUCCESS, () => {

      const { id } = initializeApplication();
      let state = reducer(INITIAL_STATE, initializeApplication.request(id, MOCK_APP_NAME));
      state = reducer(state, initializeApplication.success(id));

      expect(state.getIn([INITIALIZE_APPLICATION, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([INITIALIZE_APPLICATION, id]))
        .toEqual({
          id,
          type: initializeApplication.REQUEST,
          value: MOCK_APP_NAME,
        });
    });

    test(initializeApplication.FAILURE, () => {

      const { id } = initializeApplication();
      let state = reducer(INITIAL_STATE, initializeApplication.request(id, MOCK_APP_NAME));
      state = reducer(state, initializeApplication.failure(id, MOCK_ERR_RESPONSE));

      expect(state.getIn([INITIALIZE_APPLICATION, 'requestState'])).toEqual(RequestStates.FAILURE);
      expect(state.getIn([INITIALIZE_APPLICATION, id]))
        .toEqual({
          id,
          type: initializeApplication.REQUEST,
          value: MOCK_APP_NAME,
        });
    });

    test(initializeApplication.FINALLY, () => {

      const { id } = initializeApplication();
      let state = reducer(INITIAL_STATE, initializeApplication.request(id, MOCK_APP_NAME));
      expect(state.getIn([INITIALIZE_APPLICATION, id]))
        .toEqual({
          id,
          type: initializeApplication.REQUEST,
          value: MOCK_APP_NAME
        });

      state = reducer(state, initializeApplication.finally(id));
      expect(state.hasIn([INITIAL_STATE, id])).toEqual(false);
    });

  });

});
