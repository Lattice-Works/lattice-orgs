/*
 * @flow
 */

import { List, Map } from 'immutable';

import { EXPLORE, SELECTED_ENTITY_DATA } from '~/common/constants';

export default function selectSelectedEntityData() {

  return (state :Map) :Map<string, List> => state.getIn([EXPLORE, SELECTED_ENTITY_DATA]) || Map();
}
