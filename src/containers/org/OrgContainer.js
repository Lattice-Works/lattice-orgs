/*
 * @flow
 */

import React, { useEffect, useMemo } from 'react';

import { faFileContract, faUser } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CollaborationsApiActions } from 'lattice-sagas';
import {
  AppContentWrapper,
  Colors,
  MarkdownPreview,
  Tab,
  Tabs,
  Typography,
} from 'lattice-ui-kit';
import {
  LangUtils,
  ReduxUtils,
  useGoToRoute,
  useRequestState,
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { Link, Route, Switch } from 'react-router-dom';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import CollaborationsParticipationContainer from './CollaborationsParticipationContainer';
import OrgDataSetsContainer from './OrgDataSetsContainer';
import { DELETE_EXISTING_ORGANIZATION } from './actions';
import { OrgActionButton } from './components';

import { BadgeCheckIcon } from '../../assets';
import {
  CrumbLink,
  GapGrid,
  SpaceBetweenGrid,
  StackGrid,
} from '../../components';
import { APPS } from '../../core/edm/constants';
import { resetRequestStates } from '../../core/redux/actions';
import { COLLABORATIONS, ORGANIZATIONS, SEARCH } from '../../core/redux/constants';
import {
  selectCollaborationsByOrgId,
  selectIsAppInstalled,
  selectOrganization,
} from '../../core/redux/selectors';
import { Routes } from '../../core/router';
import { ORG, ORG_COLLABORATIONS } from '../../core/router/Routes';
import {
  SEARCH_ORGANIZATION_DATA_SETS,
  searchOrganizationDataSets,
} from '../../core/search/actions';
import { MAX_HITS_10 } from '../../core/search/constants';

const { PURPLE } = Colors;
const { isNonEmptyString } = LangUtils;
const {
  isStandby,
  isSuccess,
} = ReduxUtils;
const { GET_COLLABORATIONS_WITH_ORGANIZATION, getCollaborationsWithOrganization } = CollaborationsApiActions;

const OrgContainer = ({
  organizationId,
} :{|
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();
  const location = useLocation();

  const deleteOrgRS :?RequestState = useRequestState([ORGANIZATIONS, DELETE_EXISTING_ORGANIZATION]);
  const searchOrgDataSetsRS :?RequestState = useRequestState([SEARCH, SEARCH_ORGANIZATION_DATA_SETS]);
  const getCollabWithOrgRS :?RequestState = useRequestState([COLLABORATIONS, GET_COLLABORATIONS_WITH_ORGANIZATION]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const isInstalled :boolean = useSelector(selectIsAppInstalled(APPS.ACCESS_REQUESTS, organizationId));
  const collaborationsByOrganizationId = useSelector(selectCollaborationsByOrgId(organizationId));

  const collaborationHref = ORG_COLLABORATIONS.replace(':organizationId', organizationId);
  const orgHref = ORG.replace(':organizationId', organizationId);

  useEffect(() => {
    dispatch(getCollaborationsWithOrganization(organizationId));
  }, [dispatch, organizationId]);

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

    const collabCount = collaborationsByOrganizationId.size;
    const collabTabText = isSuccess(getCollabWithOrgRS) ? `Collaborations (${collabCount})` : 'Collaborations';

    return (
      <AppContentWrapper>
        <StackGrid>
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
          <Tabs
              aria-label="tabs"
              indicatorColor="primary"
              textColor="primary"
              value={location.pathname}>
            <Tab
                component={Link}
                to={orgHref}
                label="Data Sets"
                value={orgHref} />
            <Tab
                component={Link}
                to={collaborationHref}
                label={collabTabText}
                value={collaborationHref} />
          </Tabs>
          <Switch>
            <Route
                path={ORG}
                exact
                render={() => <OrgDataSetsContainer organizationId={organizationId} />} />
            <Route
                exact
                path={ORG_COLLABORATIONS}
                render={() => (
                  <CollaborationsParticipationContainer
                      collaborations={collaborationsByOrganizationId}
                      type="organization" />
                )} />
          </Switch>
        </StackGrid>
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgContainer;
