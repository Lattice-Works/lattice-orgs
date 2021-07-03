/*
 * @flow
 */

import { List, Map } from 'immutable';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { DATA_SET_ID, IS_OWNER, MY_KEYS } from '~/common/constants';

import { initializeOrganizationDataSet } from '../../edm/actions';

export default function reducer(state :Map, action :SequenceAction) {

  return initializeOrganizationDataSet.reducer(state, action, {
    SUCCESS: () => {
      if (action.value[IS_OWNER] === true) {
        const dataSetId :UUID = action.value[DATA_SET_ID];
        const keys :List<List<UUID>> = List().push(List([dataSetId]));
        return state.mergeIn([MY_KEYS], keys);
      }
      return state;
    },
  });
}
