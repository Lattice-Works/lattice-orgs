/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import debounce from 'lodash/debounce';
import {
  List,
  Map
} from 'immutable';
import { AuthUtils } from 'lattice-auth';
import {
  CardSegment,
  Radio,
  SearchInput,
  Typography,
} from 'lattice-ui-kit';
import { PersonUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type {
  Ace,
  Organization,
  Principal,
  UUID
} from 'lattice';

import { getPrincipal, getUserTitle } from '~/common/utils';
import { SpaceBetweenGrid, StackGrid } from '~/components';
import { selectOrganization, selectOrganizationMembers } from '~/core/redux/selectors';

const { getUserId } = PersonUtils;

const principalEquals = (principal1 :?Principal, principal2 :?Principal) :boolean => (
  // NOTE: forcing a boolean result using !! to avoid returning undefined
  !!(principal1?.valueOf() === principal2?.valueOf())
);

const stringsMatchQuery = (searchQuery :string, values :string[]) => values
  .some((value) => value && value.toLowerCase().includes(searchQuery.toLowerCase()));

const StepSelectRoleOrUser = ({
  existingPermissions,
  organizationId,
  setRoleOrUserPrincipleId,
  setTargetRoleOrUserPrincipleType,
  setTargetRoleOrUserTitle,
  targetRoleOrUserPrincipal
} :{
  existingPermissions :Map<Principal, Map<List<UUID>, Ace>>;
  organizationId :UUID;
  setRoleOrUserPrincipleId :(id :string) => void;
  setTargetRoleOrUserTitle :(title :string) => void;
  setTargetRoleOrUserPrincipleType :(type :string) => void;
  targetRoleOrUserPrincipal :?Principal;
}) => {
  const thisUserInfo = AuthUtils.getUserInfo() || { id: '' };
  const thisUserId = thisUserInfo.id;
  const [searchQuery, setSearchQuery] = useState('');

  const debounceSetQuery = debounce((value) => {
    setSearchQuery(value);
  }, 250);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const orgMembers :List<Map> = useSelector(selectOrganizationMembers(organizationId));

  const userRoleOptions = useMemo(() => {
    const options = [];
    const permissionsExistOnRole = (optionPrincipal :?Principal) => existingPermissions
      .some(({ principal } :Ace) => optionPrincipal && principalEquals(principal, optionPrincipal));
    // add org members that don't already have permissions on object to options
    orgMembers.toJS().forEach((member :Object) => {
      const label = getUserTitle(member, thisUserId);
      const memberId :string = getUserId(member) || '';
      const principalValue :?Principal = getPrincipal(member);
      if (!permissionsExistOnRole(principalValue) && stringsMatchQuery(searchQuery, [memberId, label])) {
        options.push({
          label,
          principal: principalValue
        });
      }
    });
    // add org roles that don't already have permissions on object to options
    organization?.roles.forEach((role :Object) => {
      const label = role.title;
      const roleId :string = role.id || '';
      const principalValue :Object = role.principal || {};
      if (!permissionsExistOnRole(principalValue) && stringsMatchQuery(searchQuery, [roleId, label])) {
        options.push({
          label,
          principal: principalValue
        });
      }
    });
    return options;
  }, [existingPermissions, organization, orgMembers, thisUserId, searchQuery]);

  const handleOnChangeSelectRoleObject = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const { id, value, title } = event.currentTarget;
    setRoleOrUserPrincipleId(id);
    setTargetRoleOrUserPrincipleType(value);
    setTargetRoleOrUserTitle(title);
  };

  return (
    <StackGrid gap={32}>
      <StackGrid>
        <Typography>
          Search for an existing user or role to create a permission for.
        </Typography>
        <SearchInput
            onChange={(event :SyntheticEvent<HTMLInputElement>) => debounceSetQuery(event.currentTarget.value)} />
      </StackGrid>
      <StackGrid>
        {
          searchQuery.length > 0 && (
            <div>
              {
                Object.values(userRoleOptions).map((role :Object) => (
                  <CardSegment key={role.principal.id} padding="8px 0">
                    <SpaceBetweenGrid>
                      <div>
                        <Typography variant="span">{role.label}</Typography>
                      </div>
                      <Radio
                          checked={principalEquals(role.principal, targetRoleOrUserPrincipal)}
                          id={role.principal.id}
                          value={role.principal.type}
                          title={role.label}
                          name="select-role-object"
                          onChange={handleOnChangeSelectRoleObject} />
                    </SpaceBetweenGrid>
                  </CardSegment>
                ))
              }
            </div>
          )
        }
      </StackGrid>
    </StackGrid>
  );
};

export default StepSelectRoleOrUser;
