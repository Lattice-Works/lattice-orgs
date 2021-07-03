/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { PrincipalsApiActions } from 'lattice-sagas';

import { ATLAS_CREDENTIALS, RS_INITIAL_STATE } from '~/common/constants';

import clearAtlasCredentialsReducer from './clearAtlasCredentialsReducer';
import getAtlasCredentialsReducer from './getAtlasCredentialsReducer';
import regenerateCredentialReducer from './regenerateCredentialReducer';

import { CLEAR_ATLAS_CREDENTIALS } from '../actions';

const {
  GET_ATLAS_CREDENTIALS,
  REGENERATE_CREDENTIAL,
  getAtlasCredentials,
  regenerateCredential
} = PrincipalsApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [GET_ATLAS_CREDENTIALS]: RS_INITIAL_STATE,
  [REGENERATE_CREDENTIAL]: RS_INITIAL_STATE,
  // data
  [ATLAS_CREDENTIALS]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case CLEAR_ATLAS_CREDENTIALS: {
      return clearAtlasCredentialsReducer(state);
    }

    case getAtlasCredentials.case(action.type): {
      return getAtlasCredentialsReducer(state, action);
    }

    case regenerateCredential.case(action.type): {
      return regenerateCredentialReducer(state, action);
    }

    default:
      return state;
  }
}
