/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { PrincipalsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { ATLAS_CREDENTIALS, REQUEST_STATE } from '~/common/constants';

const { GET_ATLAS_CREDENTIALS, getAtlasCredentials } = PrincipalsApiActions;

export default function reducer(state :Map, action :SequenceAction) {

  return getAtlasCredentials.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_ATLAS_CREDENTIALS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_ATLAS_CREDENTIALS, action.id], action),
    SUCCESS: () => {
      const storedAction = state.getIn([GET_ATLAS_CREDENTIALS, action.id]);
      if (storedAction) {
        return state
          .set(ATLAS_CREDENTIALS, fromJS(action.value))
          .setIn([GET_ATLAS_CREDENTIALS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_ATLAS_CREDENTIALS, action.id])) {
        return state.setIn([GET_ATLAS_CREDENTIALS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_ATLAS_CREDENTIALS, action.id]),
  });
}
