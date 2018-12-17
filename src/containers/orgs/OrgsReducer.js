/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { matchPath } from 'react-router';
import type { Match } from 'react-router';

import * as Routes from '../../core/router/Routes';
import { SWITCH_ORGANIZATION } from './OrgsActions';
import { getOrganizationId } from './OrgsUtils';

const { getAllOrganizations } = OrganizationsApiActions;

const INITIAL_STATE :Map<*, *> = fromJS({
  isFetchingAllOrganizations: false,
  organizations: List(),
  selectedOrganizationId: '',
});

export default function orgsReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case SWITCH_ORGANIZATION:
      return state.set('selectedOrganizationId', action.orgId);

    case getAllOrganizations.case(action.type): {
      return getAllOrganizations.reducer(state, action, {
        REQUEST: () => state
          .set('isFetchingAllTypes', true)
          .set('selectedOrganizationId', ''),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const organizations :List = fromJS(seqAction.value);

          /*
           * choosing the selected organization requires checking 3 places, in order of priority:
           *   1. URL
           *   2. localstorage
           *   3. organizations data
           */
          let selectedOrganizationId :string = '';
          // by default, choose the first organization from the response data
          if (organizations && !organizations.isEmpty()) {
            selectedOrganizationId = organizations.getIn([0, 'id']);
          }

          // check localstorage for a previously stored organization id
          const storedOrganizationId :?string = getOrganizationId();
          if (storedOrganizationId) {
            selectedOrganizationId = storedOrganizationId;
          }

          // URL trumps everything
          const match :?Match = matchPath(window.location.hash.slice(1), { path: Routes.ORG });
          if (match && match.params.id) {
            const maybeOrgId :UUID = match.params.id;
            const isRealOrganizationId :number = organizations.findIndex((org :Map) => org.get('id') === maybeOrgId);
            if (isRealOrganizationId !== -1) {
              selectedOrganizationId = maybeOrgId;
            }
          }

          return state
            .set('organizations', fromJS(action.value))
            .set('selectedOrganizationId', selectedOrganizationId);
        },
        FAILURE: () => state
          .set('organizations', Map())
          .set('selectedOrganizationId', ''),
        FINALLY: () => state.set('isFetchingAllTypes', false),
      });
    }

    default:
      return state;
  }
}
