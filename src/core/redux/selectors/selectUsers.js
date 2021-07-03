/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import { LangUtils } from 'lattice-utils';

import { USERS } from '~/common/constants';

const { isNonEmptyString } = LangUtils;

export default function selectUsers(userIds :?Set<string> | Array<string>) {

  return (state :Map) :Map<string, Map> => {

    const users :Map = getIn(state, [USERS, USERS]) || Map();
    if (!userIds) {
      return users;
    }

    const usersMap = Map().withMutations((map :Map) => {
      userIds.forEach((userId :string) => {
        if (isNonEmptyString(userId)) {
          const user = getIn(state, [USERS, USERS, userId]) || Map();
          map.set(userId, user);
        }
      });
    });

    return usersMap;
  };
}
