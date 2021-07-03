/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';

import { ERROR, REQUEST_STATE } from '~/common/constants';

import type { ResetRequestStatesAction } from '../actions';

export default function reducer(state :Map, action :ResetRequestStatesAction) {

  const { actions = [] } = action;
  let newState = state;
  actions.forEach((requestStateAction :string) => {
    if (state.hasIn([requestStateAction])) {
      newState = newState
        .setIn([requestStateAction, ERROR], false)
        .setIn([requestStateAction, REQUEST_STATE], RequestStates.STANDBY);
    }
  });

  return newState;
}
