/*
 * @flow
 */

import { Map, getIn } from 'immutable';

import { ACCOUNT, ATLAS_CREDENTIALS } from '~/common/constants';

export default function selectAtlasCredentials() {
  return (state :Map) :Map => getIn(state, [ACCOUNT, ATLAS_CREDENTIALS]) || Map();
}
