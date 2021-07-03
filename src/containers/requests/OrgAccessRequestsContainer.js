/*
 * @flow
 */

import React, { useMemo } from 'react';

import { AccessRequestContainer } from '@openlattice/access-request';
import { AppContentWrapper } from 'lattice-ui-kit';
import { RoutingUtils, ValidationUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import { Redirect, useRouteMatch } from 'react-router';
import type { Organization, UUID } from 'lattice';

import { APPS } from '~/common/constants';
import { CrumbItem, CrumbLink, Crumbs } from '~/components';
import { selectIsAppInstalled, selectOrganization } from '~/core/redux/selectors';
import { Routes } from '~/core/router';

const { getParamFromMatch } = RoutingUtils;
const { isValidUUID } = ValidationUtils;

const OrgAccessRequestsContainer = ({
  organizationId,
  organizationRoute,
} :{|
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const match = useRouteMatch();

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const isInstalled :boolean = useSelector(selectIsAppInstalled(APPS.ACCESS_REQUESTS, organizationId));

  // NOTE: this is super temporary
  let requestId :?UUID;
  const matchOrganizationAccessRequest = useRouteMatch(Routes.ORG_ACCESS_REQUEST);
  if (matchOrganizationAccessRequest) {
    requestId = getParamFromMatch(matchOrganizationAccessRequest, Routes.REQUEST_ID_PARAM);
  }

  const requestsPath = useMemo(() => (
    Routes.ORG_ACCESS_REQUESTS.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (!isInstalled) {
    return (
      <Redirect to={organizationRoute} />
    );
  }

  if (organization) {

    // NOTE: this is super temporary
    const crumbs = [
      <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
    ];
    if (isValidUUID(requestId)) {
      crumbs.push(
        <CrumbLink to={requestsPath}>Access Requests</CrumbLink>
      );
      crumbs.push(
        <CrumbItem>{requestId}</CrumbItem>
      );
    }
    else {
      crumbs.push(
        <CrumbItem>Access Requests</CrumbItem>
      );
    }

    return (
      <AppContentWrapper>
        <Crumbs>{crumbs}</Crumbs>
        <AccessRequestContainer match={match} organizationId={organizationId} root={Routes.ORG_ACCESS_REQUESTS} />
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgAccessRequestsContainer;
