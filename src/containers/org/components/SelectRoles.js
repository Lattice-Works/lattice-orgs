/*
 * @flow
 */

import React, { useState } from 'react';

import debounce from 'lodash/debounce';
import { List, Map } from 'immutable';
import { Types } from 'lattice';
import {
  List as LUKList,
  SearchInput,
  Typography,
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { Role } from 'lattice';

import RoleListItem from './RoleListItem';

import { PERMISSIONS } from '~/common/constants';
import { getUserProfile } from '~/common/utils';
import { Spinner } from '~/components';
import { GET_CURRENT_ROLE_AUTHORIZATIONS } from '~/core/permissions/actions';
import { selectCurrentRoleAuthorizations } from '~/core/redux/selectors';

const { isSuccess } = ReduxUtils;
const { PermissionTypes } = Types;

type Props = {
  members :Map;
  onClick :(role :Role) => void;
  roles :Role[];
  selectedRoles :Map;
};

const SelectRoles = ({
  members,
  onClick,
  roles,
  selectedRoles,
} :Props) => {

  const currentRoleAuthorizations :Map = useSelector(selectCurrentRoleAuthorizations());
  const requestState = useRequestState([PERMISSIONS, GET_CURRENT_ROLE_AUTHORIZATIONS]);
  const [filterQuery, setFilterQuery] = useState('');

  const success = isSuccess(requestState);
  const debounceSetSearchTerm = debounce((value) => {
    setFilterQuery(value);
  }, 250);

  const onSearchInputChange = (event :SyntheticEvent<HTMLInputElement>) => {
    debounceSetSearchTerm(event.currentTarget.value);
  };

  let filteredRoles = roles;
  if (filterQuery) {
    filteredRoles = filteredRoles
      .filter((role) => role.title.toLowerCase().includes(filterQuery.toLowerCase()));
  }

  const { name, email } = getUserProfile(members.first());
  const selectedText = members.size === 1
    ? (name || email)
    : `${members.size} users`;

  return (
    <div>
      <Typography color="textSecondary" gutterBottom>
        {`These are all the roles you can add to ${selectedText}.`}
      </Typography>
      <SearchInput
          onChange={onSearchInputChange}
          placeholder="Search for a role by name" />
      <LUKList>
        { !success && <Spinner size="3x" />}
        {
          success && filteredRoles.map((role, index) => {
            const authorized = currentRoleAuthorizations.getIn([List(role.aclKey), PermissionTypes.OWNER], false);
            const id = role.id || '';
            return (
              <RoleListItem
                  disabled={!authorized}
                  checked={selectedRoles.has(id)}
                  disableGutters
                  divider={index !== filteredRoles.length - 1}
                  key={`select-role-${id}`}
                  onSecondaryChange={onClick}
                  role={role} />
            );
          })
        }
      </LUKList>
    </div>
  );
};

SelectRoles.defaultProps = {
  selectedRoles: Map()
};

export default SelectRoles;
