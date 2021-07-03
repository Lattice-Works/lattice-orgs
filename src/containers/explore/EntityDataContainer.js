/*
 * @flow
 */

import React, { useEffect } from 'react';

import { List, Map } from 'immutable';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { FQN, Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  EXPLORE,
  METADATA,
  NAME,
  TITLE,
} from '~/common/constants';
import { clipboardWriteText } from '~/common/utils';
import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  LinkButton,
  SpaceBetweenGrid,
  Spinner,
  StackGrid,
} from '~/components';
import {
  selectEntityNeighborsMap,
  selectOrgDataSet,
  selectOrganization,
  selectSelectedEntityData
} from '~/core/redux/selectors';
import { Routes } from '~/core/router';

import EntityNeighborsContainer from './EntityNeighborsContainer';
import {
  EXPLORE_ENTITY_DATA,
  exploreEntityData,
  exploreEntityNeighbors
} from './actions';
import { EntityDataGrid } from './components';

const { isPending } = ReduxUtils;

const EntityDataContainer = ({
  dataSetDataRoute,
  dataSetId,
  entityKeyId,
  isModal = false,
  organizationId,
  organizationRoute,
} :{|
  dataSetDataRoute ?:string;
  dataSetId :UUID;
  entityKeyId :UUID;
  isModal ?:boolean;
  organizationId :UUID;
  organizationRoute ?:string;
|}) => {
  const dispatch = useDispatch();

  const { origin, pathname } = window.location;

  const linkString = `${origin}${pathname}#${
    Routes.ENTITY
      .replace(Routes.DATA_SET_ID_PARAM, dataSetId)
      .replace(Routes.ENTITY_KEY_ID_PARAM, entityKeyId)
      .replace(Routes.ORG_ID_PARAM, organizationId)
  }`;

  const exploreEntityDataRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ENTITY_DATA]);
  const dataSet :Map<FQN, List> = useSelector(selectOrgDataSet(organizationId, dataSetId));
  const entityData :Map = useSelector(selectSelectedEntityData());
  const neighbors :Map = useSelector(selectEntityNeighborsMap(entityKeyId));
  const organization :?Organization = useSelector(selectOrganization(organizationId));

  const dataSetName :string = dataSet.get(NAME);
  const dataSetTitle :string = dataSet.getIn([METADATA, TITLE]);

  useEffect(() => {
    dispatch(exploreEntityData({ entityKeyId, entitySetId: dataSetId }));
    dispatch(exploreEntityNeighbors({ entityKeyId, entitySetId: dataSetId }));
  }, [dispatch, entityKeyId, dataSetId]);

  if (isPending(exploreEntityDataRS)) {
    return (
      <AppContentWrapper>
        <Spinner />
      </AppContentWrapper>
    );
  }

  if (entityData && dataSetId && organizationId) {
    return (
      <>
        <AppContentWrapper>
          {
            organization && dataSet && !isModal && (
              <Crumbs>
                <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
                <CrumbLink to={dataSetDataRoute}>{dataSetTitle || dataSetName}</CrumbLink>
                <CrumbItem>{entityKeyId}</CrumbItem>
              </Crumbs>
            )
          }
          <StackGrid gap={48}>
            <StackGrid>
              <SpaceBetweenGrid>
                <Typography variant="h1">{entityKeyId}</Typography>
                <LinkButton
                    color="default"
                    onClick={() => clipboardWriteText(linkString)}>
                  Copy Link
                </LinkButton>
              </SpaceBetweenGrid>
              <EntityDataGrid data={entityData} dataSetId={dataSetId} organizationId={organizationId} />
            </StackGrid>
            <StackGrid>
              <Typography variant="h2">Explore</Typography>
              <EntityNeighborsContainer
                  isModal={isModal}
                  neighbors={neighbors}
                  organizationId={organizationId} />
            </StackGrid>
          </StackGrid>
        </AppContentWrapper>
      </>
    );
  }
  return null;
};

EntityDataContainer.defaultProps = {
  organizationRoute: '',
  dataSetDataRoute: '',
  isModal: false
};

export default EntityDataContainer;
