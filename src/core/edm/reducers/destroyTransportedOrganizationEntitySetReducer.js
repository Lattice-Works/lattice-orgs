/*
 * @flow
 */

import { List, Map } from 'immutable';
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
const {
  DESTROY_TRANSPORTED_ORGANIZATION_ENTITY_SET,
  destroyTransportedOrganizationEntitySet
} = OrganizationsApiActions;

export default function destroyTransportedOrganizationEntitySetReducer(state :Map, action :SequenceAction) {

  return destroyTransportedOrganizationEntitySet.reducer(state, action, {
    REQUEST: () => state
      .setIn([DESTROY_TRANSPORTED_ORGANIZATION_ENTITY_SET, REQUEST_STATE], RequestStates.PENDING)
      .setIn([DESTROY_TRANSPORTED_ORGANIZATION_ENTITY_SET, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([DESTROY_TRANSPORTED_ORGANIZATION_ENTITY_SET, action.id])) {
        const storedAction = state.getIn([DESTROY_TRANSPORTED_ORGANIZATION_ENTITY_SET, action.id]);
        const { entitySetId } = storedAction.value;

        let entitySets :List<EntitySet> = state.get(ENTITY_SETS);
        const entitySetsIndexMap :Map<UUID | FQN, number> = state.get(ENTITY_SETS_INDEX_MAP);

        const index = entitySetsIndexMap.get(entitySetId);
        const entitySet :EntitySet = entitySets.get(index);
        const newEntitySet = (new EntitySetBuilder(entitySet));
        if (Array.isArray(entitySet.flags)) {
          const flags = entitySet.flags.filter((flag) => flag !== EntitySetFlagTypes.TRANSPORTED);
          newEntitySet.setFlags(flags);
        }

        entitySets = entitySets.set(index, newEntitySet.build());

        return state
          .set(ENTITY_SETS, entitySets)
          .setIn([DESTROY_TRANSPORTED_ORGANIZATION_ENTITY_SET, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => state.setIn([DESTROY_TRANSPORTED_ORGANIZATION_ENTITY_SET, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([DESTROY_TRANSPORTED_ORGANIZATION_ENTITY_SET, action.id]),
  });
}
