/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import type { Organization, UUID } from 'lattice';

import { ORGANIZATIONS } from '~/common/constants';

export default function selectOrganizations() {

  return (state :Map) :Map<UUID, Organization> => getIn(state, [ORGANIZATIONS, ORGANIZATIONS]) || Map();
}
