/*
 * @flow
 */

import React, { useReducer, useState } from 'react';

import styled from 'styled-components';
import { List, Set } from 'immutable';
import {
  AppContentWrapper,
  CardSegment,
  PaginationToolbar,
  SearchInput,
  Typography,
} from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { Organization, Role, UUID } from 'lattice';

import { FILTER, MAX_HITS_20, PAGE } from '~/common/constants';
import {
  ActionsGrid,
  CrumbItem,
  CrumbLink,
  Crumbs,
  PlusButton,
  StackGrid,
} from '~/components';
import { selectMyKeys, selectOrganization } from '~/core/redux/selectors';
import { Routes } from '~/core/router';

import { AddRoleToOrgModal } from './components';

const { pagination } = ReduxUtils;

const RoleLink = styled(Link)`
  color: inherit;
  text-decoration: none;

  &:focus {
    outline: none;
    text-decoration: underline;
  }
`;

const OrgRolesContainer = ({
  organizationId,
  organizationRoute,
} :{|
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const [isVisibleAddRoleToOrgModal, setIsVisibleAddRoleToOrgModal] = useState(false);
  const [paginationState, paginationDispatch] = useReducer(pagination.reducer, pagination.INITIAL_STATE);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());
  const isOwner :boolean = myKeys.has(List([organizationId]));

  if (organization) {

    let filteredRoles :Role[] = organization.roles;
    if (paginationState.query) {
      filteredRoles = filteredRoles.filter((role :Role) => (
        role.title.toLowerCase().includes(paginationState.query.toLowerCase())
      ));
    }

    const pageRoles = filteredRoles.slice(paginationState.start, paginationState.start + MAX_HITS_20);

    const handleOnChangeFilterQuery = (event :SyntheticInputEvent<HTMLInputElement>) => {
      paginationDispatch({ type: FILTER, query: event.target.value || '' });
    };

    const handleOnPageChange = ({ page, start }) => {
      paginationDispatch({ type: PAGE, page, start });
    };

    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbItem>Roles</CrumbItem>
        </Crumbs>
        <StackGrid gap={24}>
          <StackGrid>
            <Typography variant="h1">Roles</Typography>
            <Typography>
              Roles can be used to group members together and apply batch permissions. Click on a role to manage it.
            </Typography>
          </StackGrid>
          <ActionsGrid>
            <SearchInput onChange={handleOnChangeFilterQuery} placeholder="Filter roles" />
            {
              isOwner && (
                <PlusButton aria-label="add role" onClick={() => setIsVisibleAddRoleToOrgModal(true)}>
                  <Typography component="span">Add Role</Typography>
                </PlusButton>
              )
            }
          </ActionsGrid>
          <div>
            {
              filteredRoles.length > MAX_HITS_20 && (
                <PaginationToolbar
                    count={filteredRoles.length}
                    onPageChange={handleOnPageChange}
                    page={paginationState.page}
                    rowsPerPage={MAX_HITS_20} />
              )
            }
            {
              pageRoles.map((role :Role) => {
                const roleId :UUID = (role.id :any);
                const rolePath = Routes.ORG_ROLE
                  .replace(Routes.ORG_ID_PARAM, organizationId)
                  .replace(Routes.ROLE_ID_PARAM, roleId);
                return (
                  <CardSegment key={roleId} padding="24px 0">
                    <RoleLink to={rolePath}>{role.title}</RoleLink>
                  </CardSegment>
                );
              })
            }
          </div>
        </StackGrid>
        {
          isOwner && (
            <AddRoleToOrgModal
                isVisible={isVisibleAddRoleToOrgModal}
                onClose={() => setIsVisibleAddRoleToOrgModal(false)}
                organization={organization}
                organizationId={organizationId} />
          )
        }
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgRolesContainer;
