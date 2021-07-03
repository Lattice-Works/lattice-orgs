/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';

import { HITS, SEARCH } from '~/common/constants';

export default function selectSearchHits(action :string) {

  return (state :Map) :List => getIn(state, [SEARCH, action, HITS]) || List();
}
