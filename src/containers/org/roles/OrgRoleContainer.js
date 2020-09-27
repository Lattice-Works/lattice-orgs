/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import {
  AppContentWrapper,
  PaginationToolbar,
  Spinner,
  Typography,
} from 'lattice-ui-kit';
import { LangUtils, ReduxUtils, useRequestState } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import { useDispatch, useSelector } from 'react-redux';
import type {
  Ace,
  EntitySet,
  Organization,
  PermissionType,
  Role,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
  StackGrid,
} from '../../../components';
import { GET_OR_SELECT_ENTITY_SETS, getOrSelectEntitySets } from '../../../core/edm/actions';
import { GET_PERMISSIONS, getPropertyTypePermissions } from '../../../core/permissions/actions';
import { EDM, PERMISSIONS } from '../../../core/redux/constants';
import { selectOrganizationEntitySetIds, selectPermissions } from '../../../core/redux/utils';
import { Routes } from '../../../core/router';
import { DataSetPermissionsCard, PermissionsPanel } from '../components';

const { isNonEmptyString } = LangUtils;
const { reduceRequestStates, selectEntitySets, selectOrganization } = ReduxUtils;

const MAX_PER_PAGE = 10;

const getPanelColumnSize = ({ isVisiblePanelColumn }) => (
  isVisiblePanelColumn ? 'minmax(auto,max-content)' : 'auto'
);

const AppContentGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr ${getPanelColumnSize};
  height: 100%;
`;

const ContentColumn = styled.div`
  grid-column: 2 / 3;
`;

const PanelColumn = styled.div`
  grid-column-end: 4;
  height: 100%;
`;

const SpinnerOverlay = styled.div`
  background-color: white;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: absolute;
  width: 100%;
  z-index: 1000;
`;

type Props = {
  organizationId :UUID;
  roleId :UUID;
};

const OrgRoleContainer = ({ organizationId, roleId } :Props) => {

  const dispatch = useDispatch();
  const [paginationIndex, setPaginationIndex] = useState(0);
  const [paginationPage, setPaginationPage] = useState(0);
  const [targetDataSet, setTargetDataSet] = useState();
  const [targetPermissionType, setTargetPermissionType] = useState();

  const getPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_PERMISSIONS]);
  const getOrSelectEntitySetsRS :?RequestState = useRequestState([EDM, GET_OR_SELECT_ENTITY_SETS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const role :?Role = useMemo(() => (
    organization?.roles.find((orgRole) => orgRole.id === roleId)
  ), [organization, roleId]);

  const entitySetIds :Set<UUID> = useSelector(selectOrganizationEntitySetIds(organizationId));
  const entitySetKeys :List<List<UUID>> = useMemo(() => (
    entitySetIds.map((id) => List([id]))
  ), [entitySetIds]);

  const permissions :Map<List<UUID>, Ace> = useSelector(selectPermissions(entitySetKeys, role?.principal));
  const permissionsCount :number = permissions.count();
  const pagePermissions :Map<List<UUID>, Ace> = permissions.slice(paginationIndex, paginationIndex + MAX_PER_PAGE);
  const pageDataSetIds :List<UUID> = pagePermissions.keySeq().flatten().toSet();
  const pageDataSetIdsHash :number = pageDataSetIds.hashCode();
  const pageDataSets :Map<UUID, EntitySet> = useSelector(selectEntitySets(pageDataSetIds));
  const pageDataSetsHash :number = pageDataSets.hashCode();

  useEffect(() => {
    if (!pageDataSetIds.isEmpty()) {
      dispatch(getOrSelectEntitySets(pageDataSetIds));
    }
  }, [dispatch, pageDataSetIdsHash]);

  useEffect(() => {
    if (!pageDataSets.isEmpty()) {
      dispatch(getPropertyTypePermissions(pageDataSetIds));
    }
  }, [dispatch, pageDataSetsHash]);

  const orgPath = useMemo(() => (
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (organization && role) {

    const reducedRS = reduceRequestStates([getPermissionsRS, getOrSelectEntitySetsRS]);

    const handleOnPageChange = ({ page, start }) => {
      setPaginationIndex(start);
      setPaginationPage(page);
    };

    const handleOnSelect = (dataSet :EntitySet, permission :PermissionType) => {
      setTargetDataSet(dataSet);
      setTargetPermissionType(permission);
    };

    const handleOnClosePermissionsPanel = () => {
      setTargetDataSet();
      setTargetPermissionType();
    };

    return (
      <AppContentGrid isVisiblePanelColumn={targetDataSet && targetPermissionType}>
        <ContentColumn>
          <AppContentWrapper>
            <Crumbs>
              <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
              <CrumbItem>Roles</CrumbItem>
              <CrumbItem>{role.title}</CrumbItem>
            </Crumbs>
            <Typography gutterBottom variant="h1">{role.title}</Typography>
            {
              isNonEmptyString(role.description) && (
                <Typography variant="body1">{role.description}</Typography>
              )
            }
            <Divider margin={48} />
            <Typography gutterBottom variant="h2">Data Sets</Typography>
            <Typography variant="body1">Click on a data set to manage permissions.</Typography>
            <div>
              {
                reducedRS === RequestStates.PENDING && (
                  <SpinnerOverlay>
                    <Spinner size="2x" />
                  </SpinnerOverlay>
                )
              }
              {
                reducedRS === RequestStates.SUCCESS && (
                  <StackGrid>
                    {
                      permissionsCount > MAX_PER_PAGE && (
                        <PaginationToolbar
                            page={paginationPage}
                            count={permissionsCount}
                            onPageChange={handleOnPageChange}
                            rowsPerPage={MAX_PER_PAGE} />
                      )
                    }
                    {
                      pageDataSets.map((dataSet :EntitySet) => (
                        <DataSetPermissionsCard
                            key={dataSet.id}
                            onSelect={handleOnSelect} />
                      )).valueSeq()
                    }
                  </StackGrid>
                )
              }
            </div>
          </AppContentWrapper>
        </ContentColumn>
        {
          targetDataSet && targetPermissionType && (
            <PanelColumn>
              <PermissionsPanel
                  dataSet={targetDataSet}
                  onClose={handleOnClosePermissionsPanel}
                  principal={role.principal}
                  permissionType={targetPermissionType} />
            </PanelColumn>
          )
        }
      </AppContentGrid>
    );
  }

  // LOG.error()
  return null;
};

export default OrgRoleContainer;
