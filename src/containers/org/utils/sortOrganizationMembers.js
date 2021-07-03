/*
 * @flow
 */

import { Map } from 'immutable';

import { getUserTitle } from '~/common/utils';

export default function sortOrganizationMembers(user1 :Object | Map, user2 :Object | Map) {

  const title1 :string = getUserTitle(user1);
  const title2 :string = getUserTitle(user2);

  if (title1 < title2) {
    return -1;
  }

  if (title1 > title2) {
    return 1;
  }

  return 0;
}
