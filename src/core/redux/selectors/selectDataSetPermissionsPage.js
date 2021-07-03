/*
 * @flow
 */

import { Map, getIn } from 'immutable';

import { DATA_SET_PERMISSIONS_PAGE, PERMISSIONS } from '~/common/constants';

export default function selectDataSetPermissionsPage() {

  return (state :Map) :Map => getIn(state, [PERMISSIONS, DATA_SET_PERMISSIONS_PAGE]) || Map();
}
