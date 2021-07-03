/*
 * @flow
 */

import { List, Map, Set } from 'immutable';
import { Models, Types } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { EntitySet, FQN, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ENTITY_SETS,
  ENTITY_SETS_INDEX_MAP,
  REQUEST_STATE,
} from '~/common/constants';

const { EntitySetFlagTypes } = Types;
const { EntitySetBuilder } = Models;
const { TRANSPORT_ORGANIZATION_ENTITY_SET, transportOrganizationEntitySet } = OrganizationsApiActions;

export default function transportOrganizationEntitySetReducer(state :Map, action :SequenceAction) {

  return transportOrganizationEntitySet.reducer(state, action, {
    REQUEST: () => state
      .setIn([TRANSPORT_ORGANIZATION_ENTITY_SET, REQUEST_STATE], RequestStates.PENDING)
      .setIn([TRANSPORT_ORGANIZATION_ENTITY_SET, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([TRANSPORT_ORGANIZATION_ENTITY_SET, action.id])) {
        const storedAction = state.getIn([TRANSPORT_ORGANIZATION_ENTITY_SET, action.id]);
        const { entitySetId } = storedAction.value;

        let entitySets :List<EntitySet> = state.get(ENTITY_SETS);
        const entitySetsIndexMap :Map<UUID | FQN, number> = state.get(ENTITY_SETS_INDEX_MAP);

        const index = entitySetsIndexMap.get(entitySetId);
        const entitySet :EntitySet = entitySets.get(index);
        const newEntitySet = (new EntitySetBuilder(entitySet));
        if (Array.isArray(entitySet.flags)) {
          const flags = Set([...entitySet.flags, EntitySetFlagTypes.TRANSPORTED]).toArray();
          newEntitySet.setFlags(flags);
        }
        else {
          newEntitySet.setFlags([EntitySetFlagTypes.TRANSPORTED]);
        }

        entitySets = entitySets.set(index, newEntitySet.build());

        return state
          .set(ENTITY_SETS, entitySets)
          .setIn([TRANSPORT_ORGANIZATION_ENTITY_SET, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => state.setIn([TRANSPORT_ORGANIZATION_ENTITY_SET, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([TRANSPORT_ORGANIZATION_ENTITY_SET, action.id]),
  });
}
