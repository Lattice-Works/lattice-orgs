/*
 * @flow
 */

import { Map } from 'immutable';
import { PrincipalsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '~/common/constants';

const { REGENERATE_CREDENTIAL, regenerateCredential } = PrincipalsApiActions;

export default function reducer(state :Map, action :SequenceAction) {

  return regenerateCredential.reducer(state, action, {
    REQUEST: () => state
      .setIn([REGENERATE_CREDENTIAL, REQUEST_STATE], RequestStates.PENDING)
      .setIn([REGENERATE_CREDENTIAL, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([REGENERATE_CREDENTIAL, action.id])) {
        return state
          .setIn([REGENERATE_CREDENTIAL, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([REGENERATE_CREDENTIAL, action.id])) {
        return state.setIn([REGENERATE_CREDENTIAL, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([REGENERATE_CREDENTIAL, action.id]),
  });
}
