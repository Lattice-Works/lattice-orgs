/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import { faChevronDown } from '@fortawesome/pro-regular-svg-icons';
import { faFileContract, faUser } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import {
  AppContentWrapper,
  Box,
  Collapse,
  Colors,
  IconButton,
  MarkdownPreview,
  PaginationToolbar,
  Select,
  Typography,
} from 'lattice-ui-kit';
import {
  LangUtils,
  ReduxUtils,
  useGoToRoute,
  useRequestState,
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { BadgeCheckIcon } from '~/assets';
import {
  APPS,
  ES_FLAG_TYPE_RS_OPTIONS,
  MAX_HITS_10,
  ORGANIZATIONS,
  SEARCH,
} from '~/common/constants';
import {
  CrumbLink,
  Flip,
  GapGrid,
  SearchForm,
  SpaceBetweenGrid,
  Spinner,
  StackGrid,
} from '~/components';
import { resetRequestStates } from '~/core/redux/actions';
import {
  selectIsAppInstalled,
  selectOrganization,
  selectSearchHits,
  selectSearchPage,
  selectSearchQuery,
  selectSearchTotalHits,
} from '~/core/redux/selectors';
import { Routes } from '~/core/router';
import {
  SEARCH_ORGANIZATION_DATA_SETS,
  clearSearchState,
  searchOrganizationDataSets,
} from '~/core/search/actions';
import type { ReactSelectOption } from '~/common/types';

import { DELETE_EXISTING_ORGANIZATION } from './actions';
import { DataSetSearchResultCard, OrgActionButton } from './components';

const { PURPLE } = Colors;
const { isNonEmptyString } = LangUtils;
const {
  isPending,
  isStandby,
  isSuccess,
} = ReduxUtils;

const OrgContainer = ({
  organizationId,
} :{|
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();

  const [isOpenSearchOptions, setIsOpenSearchOptions] = useState(false);
  const [flag, setFlag] = useState();

  const deleteOrgRS :?RequestState = useRequestState([ORGANIZATIONS, DELETE_EXISTING_ORGANIZATION]);
  const searchOrgDataSetsRS :?RequestState = useRequestState([SEARCH, SEARCH_ORGANIZATION_DATA_SETS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const isInstalled :boolean = useSelector(selectIsAppInstalled(APPS.ACCESS_REQUESTS, organizationId));

  const searchPage :number = useSelector(selectSearchPage(SEARCH_ORGANIZATION_DATA_SETS));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_ORGANIZATION_DATA_SETS)) || '*';
  const searchHits :List = useSelector(selectSearchHits(SEARCH_ORGANIZATION_DATA_SETS));
  const searchTotalHits :number = useSelector(selectSearchTotalHits(SEARCH_ORGANIZATION_DATA_SETS));

  useEffect(() => {
    if (isStandby(searchOrgDataSetsRS)) {
      dispatch(
        searchOrganizationDataSets({
          maxHits: MAX_HITS_10,
          organizationId,
          query: '*',
          start: 0,
        })
      );
    }
  }, [dispatch, organizationId, searchOrgDataSetsRS]);

  const dispatchDataSetSearch = (params :{ page ?:number, query ?:string, start ?:number } = {}) => {
    const { page = 1, query = searchQuery, start = 0 } = params;
    if (isNonEmptyString(query)) {
      dispatch(
        searchOrganizationDataSets({
          flags: [flag],
          maxHits: MAX_HITS_10,
          organizationId,
          page,
          query,
          start,
        })
      );
    }
    else {
      dispatch(clearSearchState(SEARCH_ORGANIZATION_DATA_SETS));
    }
  };

  const goToRoot = useGoToRoute(Routes.ROOT);

  useEffect(() => {
    if (isSuccess(deleteOrgRS)) {
      setTimeout(() => {
        dispatch(resetRequestStates([DELETE_EXISTING_ORGANIZATION]));
      }, 1000);
      goToRoot();
    }
  });

  const peoplePath = useMemo(() => (
    Routes.ORG_PEOPLE.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const rolesPath = useMemo(() => (
    Routes.ORG_ROLES.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const requestsPath = useMemo(() => (
    Routes.ORG_ACCESS_REQUESTS.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (organization) {
    const rolesCount :number = organization.roles.length;
    const peopleCount :number = organization.members.length;
    const toggleSearchOptions = () => setIsOpenSearchOptions(!isOpenSearchOptions);

    return (
      <AppContentWrapper>
        <StackGrid gap={24}>
          <StackGrid>
            <SpaceBetweenGrid>
              <GapGrid gap={32}>
                <Typography variant="h1">{organization.title}</Typography>
                <CrumbLink to={peoplePath}>
                  <GapGrid gap={8}>
                    <FontAwesomeIcon color={PURPLE.P300} fixedWidth icon={faUser} size="lg" />
                    <Typography color="primary">{`${peopleCount} People`}</Typography>
                  </GapGrid>
                </CrumbLink>
                <CrumbLink to={rolesPath}>
                  <GapGrid gap={8}>
                    <BadgeCheckIcon />
                    <Typography color="primary">{`${rolesCount} Roles`}</Typography>
                  </GapGrid>
                </CrumbLink>
                {
                  isInstalled && (
                    <CrumbLink to={requestsPath}>
                      <GapGrid gap={8}>
                        <FontAwesomeIcon
                            color={PURPLE.P300}
                            fixedWidth
                            icon={faFileContract}
                            style={{ fontSize: '1.6em' }} />
                        <Typography color="primary">Access Requests</Typography>
                      </GapGrid>
                    </CrumbLink>
                  )
                }
              </GapGrid>
              <OrgActionButton organization={organization} />
            </SpaceBetweenGrid>
            {
              isNonEmptyString(organization.description) && (
                <MarkdownPreview>
                  {organization.description}
                </MarkdownPreview>
              )
            }
          </StackGrid>
          <Typography variant="h2">Data Sets</Typography>
          <StackGrid gap={8}>
            <SearchForm
                onSubmit={(query :string) => dispatchDataSetSearch({ query })}
                searchQuery={searchQuery}
                searchRequestState={searchOrgDataSetsRS} />
            <GapGrid gap={8}>
              <Typography variant="subtitle2">Search Options</Typography>
              <Flip flip={isOpenSearchOptions}>
                <IconButton aria-label="toggle search options" onClick={toggleSearchOptions}>
                  <FontAwesomeIcon fixedWidth icon={faChevronDown} size="xs" />
                </IconButton>
              </Flip>
            </GapGrid>
            <Collapse in={isOpenSearchOptions}>
              <Box maxWidth={240}>
                <Typography gutterBottom variant="subtitle1">Flags</Typography>
                <Select
                    isClearable
                    onChange={(option :?ReactSelectOption<string>) => setFlag(option?.value)}
                    options={ES_FLAG_TYPE_RS_OPTIONS} />
              </Box>
            </Collapse>
          </StackGrid>
          {
            !isStandby(searchOrgDataSetsRS) && (
              <PaginationToolbar
                  count={searchTotalHits}
                  onPageChange={({ page, start }) => dispatchDataSetSearch({ page, start })}
                  page={searchPage}
                  rowsPerPage={MAX_HITS_10} />
            )
          }
          {
            isPending(searchOrgDataSetsRS) && (
              <Spinner />
            )
          }
          {
            isSuccess(searchOrgDataSetsRS) && searchHits.isEmpty() && (
              <Typography align="center">No data sets.</Typography>
            )
          }
          {
            isSuccess(searchOrgDataSetsRS) && !searchHits.isEmpty() && (
              searchHits.valueSeq().map((searchHit :Map) => (
                <DataSetSearchResultCard
                    dataSet={searchHit}
                    key={searchHit.get('id')}
                    organizationId={organizationId} />
              ))
            )
          }
        </StackGrid>
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgContainer;
