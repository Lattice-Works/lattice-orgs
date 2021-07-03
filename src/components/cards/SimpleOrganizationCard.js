/*
 * @flow
 */

import React from 'react';

import { faUserFriends } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardSegment, Typography } from 'lattice-ui-kit';
import { useGoToRoute } from 'lattice-utils';
import type { Organization, UUID } from 'lattice';

import { Routes } from '~/core/router';

import { GapGrid, StackGrid } from '../grids';

const SimpleOrganizationCard = ({
  organization,
} :{|
  organization :Organization;
|}) => {

  const organizationId :UUID = (organization.id :any);
  const goToOrganization = useGoToRoute(
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId),
    { organization },
  );

  return (
    <Card id={organizationId} onClick={goToOrganization}>
      <CardSegment padding="24px">
        <StackGrid gap={8}>
          <Typography component="h2" variant="h4">{organization.title}</Typography>
          <Typography>{organization.description}</Typography>
          <GapGrid>
            <FontAwesomeIcon fixedWidth icon={faUserFriends} />
            <Typography>{organization.members.length}</Typography>
          </GapGrid>
        </StackGrid>
      </CardSegment>
    </Card>
  );
};

export default SimpleOrganizationCard;
