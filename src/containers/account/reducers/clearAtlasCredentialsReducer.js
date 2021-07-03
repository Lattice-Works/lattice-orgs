/*
 * @flow
 */

import { Map } from 'immutable';

import { ATLAS_CREDENTIALS } from '~/common/constants';

export default function reducer(state :Map) {

  return state.set(ATLAS_CREDENTIALS, Map());
}
