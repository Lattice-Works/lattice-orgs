/*
 * @flow
 */

import { List, Map, Set } from 'immutable';

import {
  AUTH0,
  SAML,
  SAMLP,
  SOCIAL
} from './constants';

export default function memberHasSelectedIdentityTypes(member :Map, selectedIdentityTypes :Set) {
  return selectedIdentityTypes.reduce((matchesAllFilters, identityType) => {
    const memberIdentities :List = member.getIn(['profile', 'identities'], List());
    let memberHasIdentityType = false;
    if (identityType === SOCIAL) {
      memberHasIdentityType = memberIdentities.find((identity) => identity.get('isSocial'));
    }
    else if (identityType === AUTH0) {
      memberHasIdentityType = memberIdentities.find((identity) => identity.get('provider') === AUTH0);
    }
    else if (identityType === SAML) {
      memberHasIdentityType = memberIdentities.find((identity) => identity.get('provider') === SAMLP);
    }
    return (matchesAllFilters && memberHasIdentityType);
  }, true);
}
