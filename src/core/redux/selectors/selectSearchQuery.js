/*
 * @flow
 */

import { Map, getIn } from 'immutable';

import { QUERY, SEARCH } from '~/common/constants';

export default function selectSearchQuery(action :string) {

  return (state :Map) :string => getIn(state, [SEARCH, action, QUERY]) || '';
}
