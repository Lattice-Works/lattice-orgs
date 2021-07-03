/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import { List, Map } from 'immutable';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';

import { METADATA, NAME, TITLE } from '~/common/constants';
import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
  StackGrid,
} from '~/components';
import { ObjectPermissionsContainer, PermissionsActionsGrid } from '~/containers/permissions';
import { GET_ORG_DATA_SET_OBJECT_PERMISSIONS } from '~/core/permissions/actions';
import { resetRequestStates } from '~/core/redux/actions';
import { selectOrgDataSet, selectOrganization } from '~/core/redux/selectors';

const OrgDataSetObjectPermissionsContainer = ({
  dataSetId,
  dataSetRoute,
  organizationId,
  organizationRoute,
} :{|
  dataSetId :UUID;
  dataSetRoute :string;
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const dispatch = useDispatch();

  const [filterByPermissionTypes, setFilterByPermissionTypes] = useState([]);
  const [filterByQuery, setFilterByQuery] = useState('');
  const [isVisibleAssignPermissionsModal, setIsVisibleAssignPermissionsModal] = useState(false);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const dataSet :Map = useSelector(selectOrgDataSet(organizationId, dataSetId));
  const name :string = dataSet.get(NAME);
  const title :string = dataSet.getIn([METADATA, TITLE]);
  const objectKey = useMemo(() => List([dataSetId]), [dataSetId]);

  useEffect(() => () => {
    dispatch(resetRequestStates([GET_ORG_DATA_SET_OBJECT_PERMISSIONS]));
  }, [dispatch]);

  const onOpenPermissionsModal = () => setIsVisibleAssignPermissionsModal(true);
  const onClosePermissionsModal = () => setIsVisibleAssignPermissionsModal(false);

  return (
    <AppContentWrapper>
      <Crumbs>
        <CrumbLink to={organizationRoute}>{organization?.title || 'Organization'}</CrumbLink>
        <CrumbLink to={dataSetRoute}>{title || name}</CrumbLink>
        <CrumbItem>Permissions</CrumbItem>
      </Crumbs>
      <StackGrid>
        <Typography variant="h1">Permissions</Typography>
        <Typography>
          Below are the users, roles, and organizations that are granted permissions on this object.
        </Typography>
        <PermissionsActionsGrid
            assignPermissionsText="Add permission"
            onChangeFilterByPermissionTypes={setFilterByPermissionTypes}
            onChangeFilterByQuery={setFilterByQuery}
            onClickAssignPermissions={onOpenPermissionsModal} />
        <Divider isVisible={false} margin={0} />
        <ObjectPermissionsContainer
            filterByPermissionTypes={filterByPermissionTypes}
            filterByQuery={filterByQuery}
            isDataSet
            isVisibleAssignPermissionsModal={isVisibleAssignPermissionsModal}
            objectKey={objectKey}
            onClosePermissionsModal={onClosePermissionsModal}
            organizationId={organizationId} />
      </StackGrid>
    </AppContentWrapper>
  );
};

export default OrgDataSetObjectPermissionsContainer;
