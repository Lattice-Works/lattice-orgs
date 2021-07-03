/*
 * @flow
 */

import { Map, Set } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  APP_INSTALLS,
  ERROR,
  REQUEST_STATE,
} from '~/common/constants';

import { IS_APP_INSTALLED, isAppInstalled } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return isAppInstalled.reducer(state, action, {
    REQUEST: () => state
      .setIn([IS_APP_INSTALLED, REQUEST_STATE], RequestStates.PENDING)
      .setIn([IS_APP_INSTALLED, action.id], action),
    SUCCESS: () => {
      const storedAction :?SequenceAction = state.getIn([IS_APP_INSTALLED, action.id]);
      if (storedAction) {
        const { appName, organizationId } = storedAction.value;
        const installed :boolean = action.value;
        return state
          .updateIn([APP_INSTALLS, appName], (orgs :Set<UUID> = Set()) => {
            if (installed === true) {
              return orgs.add(organizationId);
            }
            return orgs.delete(organizationId);
          })
          .setIn([IS_APP_INSTALLED, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      const storedAction :?SequenceAction = state.getIn([IS_APP_INSTALLED, action.id]);
      if (storedAction) {
        const { appName, organizationId } = storedAction.value;
        return state
          .deleteIn([APP_INSTALLS, appName, organizationId])
          .setIn([IS_APP_INSTALLED, ERROR], action.value)
          .setIn([IS_APP_INSTALLED, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([IS_APP_INSTALLED, action.id]),
  });
}
