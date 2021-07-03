/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import type { UUID } from 'lattice';

import { NEW_ORGANIZATION_ID, ORGANIZATIONS } from '~/common/constants';

export default function selectNewOrgId() {

  return (state :Map) :UUID => getIn(state, [ORGANIZATIONS, NEW_ORGANIZATION_ID]) || '';
}
