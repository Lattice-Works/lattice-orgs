/*
 * @flow
 */

import React, { useEffect } from 'react';

import styled from 'styled-components';
import { List, Set, fromJS } from 'immutable';
import { Types } from 'lattice';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
} from '~/components';
import {
  GET_CURRENT_ROLE_AUTHORIZATIONS,
  getCurrentRoleAuthorizations,
  resetCurrentRoleAuthorizations,
} from '~/core/permissions/actions';
import { resetRequestStates } from '~/core/redux/actions';
import { selectMyKeys, selectOrganization, selectOrganizationMembers } from '~/core/redux/selectors';
import { resetUserSearchResults } from '~/core/users/actions';

import PeopleTable from './PeopleTable';

const { PermissionTypes } = Types;

const MEMBERS_DESCRIPTION = 'People can be granted data permissions on an individual level or by an assigned role.'
  + ' Click on a role to manage its people or datasets.';

// HACK: Very long NestedMenuItem menus will not scroll unless the parent can also scroll.
// force inner wrapper to always be oversized by 1px
const StyledContentWrapper = styled(AppContentWrapper)`
  > div {
    height: calc(100vh - 64px);
  }
`;

const OrgPeopleContainer = ({
  organizationId,
  organizationRoute,
} :{|
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const dispatch = useDispatch();

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());
  const isOwner :boolean = myKeys.has(List([organizationId]));
  const orgMembers :List = useSelector(selectOrganizationMembers(organizationId));

  const roleAclKeys = fromJS(organization?.roles.reduce((aclKeys, role) => {
    aclKeys.push(role.aclKey);
    return aclKeys;
  }, []));

  useEffect(() => () => {
    dispatch(resetUserSearchResults());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCurrentRoleAuthorizations({
      aclKeys: roleAclKeys,
      permissions: [PermissionTypes.OWNER]
    }));

    return () => {
      dispatch(resetRequestStates([GET_CURRENT_ROLE_AUTHORIZATIONS]));
      dispatch(resetCurrentRoleAuthorizations());
    };
  }, [dispatch, roleAclKeys]);

  if (organization) {
    const roles = organization.roles.sort((roleA, roleB) => roleA.title.localeCompare(roleB.title));
    return (
      <StyledContentWrapper>
        <Crumbs>
          <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbItem>People</CrumbItem>
        </Crumbs>
        <Typography variant="h1">People</Typography>
        <Divider isVisible={false} margin={8} />
        <Typography component="span" color="textSecondary">{MEMBERS_DESCRIPTION}</Typography>
        <Divider isVisible={false} margin={12} />
        <Typography component="h2" variant="h3">Members</Typography>
        <PeopleTable
            isOwner={isOwner}
            members={orgMembers}
            organizationId={organizationId}
            roles={roles} />
      </StyledContentWrapper>
    );
  }

  return null;
};

export default OrgPeopleContainer;
