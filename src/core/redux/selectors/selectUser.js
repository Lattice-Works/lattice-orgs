/*
 * @flow
 */

import { Map, getIn } from 'immutable';

import { USERS } from '~/common/constants';

export default function selectUser(userId :string) {

  return (state :Map) :Map => getIn(state, [USERS, USERS, userId]) || Map();
}
