/*
 * @flow
 */

import { List, Map } from 'immutable';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { MY_KEYS } from '~/common/constants';
import { deleteExistingOrganization } from '~/containers/org/actions';

export default function reducer(state :Map, action :SequenceAction) {

  return deleteExistingOrganization.reducer(state, action, {
    SUCCESS: () => {
      const key :List<UUID> = List([action.value]);
      return state.deleteIn([MY_KEYS], key);
    },
  });
}
