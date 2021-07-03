/*
 * @flow
 */
import { Collection, Map } from 'immutable';
import type { UUID } from 'lattice';

import { DATA, ENTITY_SET_DATA } from '~/common/constants';

export default function selectOrgEntitySetData(entitySetId :UUID, entityKeyIds :Collection<UUID> | UUID[]) {
  return (state :Map) :Map<UUID, Map> => {
    const entitySetData :Map = state.getIn([DATA, ENTITY_SET_DATA, entitySetId], Map());
    return Map().withMutations((map) => {
      entityKeyIds.forEach((entityKeyId :UUID) => {
        map.set(entityKeyId, entitySetData.get(entityKeyId, Map()));
      });
    });
  };
}
