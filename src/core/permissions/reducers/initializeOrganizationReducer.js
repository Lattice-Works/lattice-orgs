/*
 * @flow
 */

import { List, Map } from 'immutable';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { initializeOrganization } from '../../../containers/org/actions';
import { IS_OWNER, MY_KEYS, ORGANIZATION_ID } from '../../redux/constants';

export default function reducer(state :Map, action :SequenceAction) {

  return initializeOrganization.reducer(state, action, {
    SUCCESS: () => {
      if (action.value[IS_OWNER] === true) {
        const organizationId :UUID = action.value[ORGANIZATION_ID];
        const keys :List<List<UUID>> = List().push(List([organizationId]));
        return state.mergeIn([MY_KEYS], keys);
      }
      return state;
    },
  });
}
