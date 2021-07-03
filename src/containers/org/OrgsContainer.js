/*
 * @flow
 */

import React, { useReducer, useState } from 'react';

import { Map } from 'immutable';
import {
  AppContentWrapper,
  PaginationToolbar,
  SearchInput,
  Typography,
} from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';

import { FILTER, MAX_HITS_10, PAGE } from '~/common/constants';
import {
  ActionsGrid,
  PlusButton,
  SimpleOrganizationCard,
  StackGrid,
} from '~/components';
import { selectOrganizations } from '~/core/redux/selectors';

import { CreateOrgModal } from './components';

const { pagination } = ReduxUtils;

const OrgsContainer = () => {

  const [isVisibleAddOrgModal, setIsVisibleCreateOrgModal] = useState(false);
  const [paginationState, paginationDispatch] = useReducer(pagination.reducer, pagination.INITIAL_STATE);

  const organizations :Map<UUID, Organization> = useSelector(selectOrganizations());
  const filteredOrganizations = organizations.filter((org :Organization, orgId :UUID) => (
    org && (paginationState.query === orgId || org.title.toLowerCase().includes(paginationState.query.toLowerCase()))
  ));
  const filteredOrganizationsCount = filteredOrganizations.count();
  const pageOrganizations :Map<UUID, Organization> = filteredOrganizations.slice(
    paginationState.start,
    paginationState.start + MAX_HITS_10,
  );

  const handleOnChangeOrgFilter = (event :SyntheticInputEvent<HTMLInputElement>) => {
    paginationDispatch({ type: FILTER, query: event.target.value || '' });
  };

  const handleOnPageChange = ({ page, start }) => {
    paginationDispatch({ type: PAGE, page, start });
  };

  return (
    <>
      <AppContentWrapper>
        <StackGrid gap={32}>
          <StackGrid>
            <Typography variant="h1">Organizations</Typography>
            <Typography>Find the organizations to which you belong.</Typography>
          </StackGrid>
          <ActionsGrid>
            <SearchInput onChange={handleOnChangeOrgFilter} placeholder="Filter organizations" />
            <PlusButton aria-label="create organization" onClick={() => setIsVisibleCreateOrgModal(true)}>
              <Typography component="span">Create Organization</Typography>
            </PlusButton>
          </ActionsGrid>
          <StackGrid gap={24}>
            {
              !pageOrganizations.isEmpty() && (
                <>
                  {
                    filteredOrganizationsCount > MAX_HITS_10 && (
                      <PaginationToolbar
                          page={paginationState.page}
                          count={filteredOrganizationsCount}
                          onPageChange={handleOnPageChange}
                          rowsPerPage={MAX_HITS_10} />
                    )
                  }
                  {
                    pageOrganizations.valueSeq().map((org :Organization) => (
                      <SimpleOrganizationCard key={org.id} organization={org} />
                    ))
                  }
                </>
              )
            }
          </StackGrid>
        </StackGrid>
      </AppContentWrapper>
      {
        isVisibleAddOrgModal && (
          <CreateOrgModal onClose={() => setIsVisibleCreateOrgModal(false)} />
        )
      }
    </>
  );
};

export default OrgsContainer;
