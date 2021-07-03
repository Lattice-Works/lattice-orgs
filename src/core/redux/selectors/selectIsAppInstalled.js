/*
 * @flow
 */

import { Map, Set, getIn } from 'immutable';
import type { UUID } from 'lattice';

import { APP_INSTALLS, EDM } from '~/common/constants';

export default function selectIsAppInstalled(appName :string, organizationId :UUID) {

  return (state :Map) :boolean => (getIn(state, [EDM, APP_INSTALLS, appName]) || Set()).has(organizationId);
}
