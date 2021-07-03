/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import type { Ace, Principal, UUID } from 'lattice';

import { ACES, PERMISSIONS } from '~/common/constants';

export default function selectPrincipalPermissions(keys :List<List<UUID>>, principal :Principal) {

  return (state :Map) :Map<List<UUID>, Ace> => (
    Map().withMutations((mutableMap :Map) => {
      keys.forEach((key :List<UUID>) => {
        const aces :List<Ace> = getIn(state, [PERMISSIONS, ACES, key]) || List();
        aces.forEach((ace :Ace) => {
          if (ace.principal.valueOf() === principal.valueOf()) {
            mutableMap.set(key, ace);
          }
        });
      });
    })
  );
}
