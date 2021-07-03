/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import type { Ace, Principal, UUID } from 'lattice';

import { ACES, PERMISSIONS } from '~/common/constants';

export default function selectPermissionsByPrincipal(keys :List<List<UUID>>) {

  return (state :Map) :Map<Principal, Map<List<UUID>, Ace>> => (
    Map().withMutations((mutableMap :Map) => {
      keys.forEach((key :List<UUID>) => {
        const aces :List<Ace> = getIn(state, [PERMISSIONS, ACES, key]) || List();
        aces.forEach((ace :Ace) => {
          mutableMap.setIn([ace.principal, key], ace);
        });
      });
    })
  );
}
