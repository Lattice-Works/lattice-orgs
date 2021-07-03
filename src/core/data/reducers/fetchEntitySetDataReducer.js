/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { DataUtils } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ENTITY_SET_DATA, REQUEST_STATE } from '~/common/constants';

import { FETCH_ENTITY_SET_DATA, fetchEntitySetData } from '../actions';

const { getEntityKeyId } = DataUtils;

export default function fetchEntitySetDataReducer(state :Map, action :SequenceAction) {
  return fetchEntitySetData.reducer(state, action, {
    REQUEST: () => {
      const { entitySetId } = action.value;
      return state
        .setIn([FETCH_ENTITY_SET_DATA, entitySetId, REQUEST_STATE], RequestStates.PENDING)
        .setIn([FETCH_ENTITY_SET_DATA, action.id], action);
    },
    SUCCESS: () => {

      if (state.hasIn([FETCH_ENTITY_SET_DATA, action.id])) {

        const storedSeqAction = state.getIn([FETCH_ENTITY_SET_DATA, action.id]);
        const { entityKeyIds, entitySetId } :{
          entityKeyIds :Set<UUID>;
          entitySetId :UUID;
        } = storedSeqAction.value;

        let entitySetData :Map = state.get(ENTITY_SET_DATA);
        fromJS(action.value).forEach((entityData :Map) => {
          const entityKeyId :?UUID = getEntityKeyId(entityData);
          // $FlowFixMe
          if (entityKeyIds.has(entityKeyId)) {
            entitySetData = entitySetData.setIn([entitySetId, entityKeyId], entityData);
          }
        });

        return state
          .set(ENTITY_SET_DATA, entitySetData)
          .setIn([FETCH_ENTITY_SET_DATA, entitySetId, REQUEST_STATE], RequestStates.SUCCESS);
      }

      return state;
    },
    FAILURE: () => {

      if (state.hasIn([FETCH_ENTITY_SET_DATA, action.id])) {
        const storedSeqAction = state.getIn([FETCH_ENTITY_SET_DATA, action.id]);
        const { entitySetId } :{ entitySetId :UUID } = storedSeqAction.value;
        return state.setIn([FETCH_ENTITY_SET_DATA, entitySetId, REQUEST_STATE], RequestStates.FAILURE);
      }

      return state;
    },
    FINALLY: () => state.deleteIn([FETCH_ENTITY_SET_DATA, action.id]),
  });
}
