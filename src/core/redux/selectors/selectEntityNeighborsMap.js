/*
 * @flow
 */

import { Map } from 'immutable';
import type { UUID } from 'lattice';

import { ENTITY_NEIGHBORS_MAP, EXPLORE } from '~/common/constants';

export default function selectEntityNeighborsMap(entityKeyId :UUID) {
  return (state :Map) :Map<UUID, Map> => (
    state.getIn([EXPLORE, ENTITY_NEIGHBORS_MAP, entityKeyId], Map())
  );
}
