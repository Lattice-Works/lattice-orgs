/*
 * @flow
 */

import { List, Map, Set } from 'immutable';

export default function memberHasSelectedRoles(member :Map, selectedRoles :Set) {
  return selectedRoles.reduce((matchesAllFilters, roleId) => {
    const memberRoles :List = member.get('roles', List());
    const memberHasRole = !!memberRoles.find((role) => role.get('id') === roleId);
    return (matchesAllFilters && memberHasRole);
  }, true);
}
