/*
 * @flow
 */

import { Map, Set } from 'immutable';
import type { UUID } from 'lattice';

import { DATA, ENTITY_SET_DATA } from '~/common/constants';

export default function selectStoredEntityKeyIds(entitySetId :UUID, entityKeyIds :Set<UUID>) {
  return (state :Map) :Set<UUID> => (
    state
      .getIn([DATA, ENTITY_SET_DATA, entitySetId], Map())
      .keySeq()
      .filter((entityKeyId :UUID) => entityKeyIds.has(entityKeyId))
      .toSet()
  );
}
