/*
 * @flow
 */

import { Map, getIn } from 'immutable';

import { SEARCH, TOTAL_HITS } from '~/common/constants';

export default function selectSearchTotalHits(action :string) {

  return (state :Map) :number => getIn(state, [SEARCH, action, TOTAL_HITS]) || 0;
}
