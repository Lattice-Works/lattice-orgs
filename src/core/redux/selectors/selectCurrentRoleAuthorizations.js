/*
 * @flow
 */

import { Map, getIn } from 'immutable';

import { CURRENT_ROLE_AUTHORIZATIONS, PERMISSIONS } from '~/common/constants';

export default function selectCurrentRoleAuthorizations() {

  return (state :Map) :Map => getIn(state, [PERMISSIONS, CURRENT_ROLE_AUTHORIZATIONS], Map());
}
