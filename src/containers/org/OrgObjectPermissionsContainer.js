/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import { List } from 'immutable';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { PERMISSIONS } from '~/common/constants';
import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
  StackGrid,
} from '~/components';
import { ObjectPermissionsContainer, PermissionsActionsGrid } from '~/containers/permissions';
import { GET_ORG_OBJECT_PERMISSIONS, getOrgObjectPermissions } from '~/core/permissions/actions';
import { resetRequestStates } from '~/core/redux/actions';
import { selectOrganization } from '~/core/redux/selectors';

const OrgObjectPermissionsContainer = ({
  organizationId,
  organizationRoute,
} :{
  organizationId :UUID;
  organizationRoute :string;
}) => {

  const dispatch = useDispatch();

  const [filterByPermissionTypes, setFilterByPermissionTypes] = useState([]);
  const [filterByQuery, setFilterByQuery] = useState('');
  const [isVisibleAssignPermissionsModal, setIsVisibleAssignPermissionsModal] = useState(false);

  const getOrgObjectPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_ORG_OBJECT_PERMISSIONS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));

  const objectKey = useMemo(() => List([organizationId]), [organizationId]);

  useEffect(() => {
    if (getOrgObjectPermissionsRS === RequestStates.STANDBY) {
      dispatch(getOrgObjectPermissions(List().push(objectKey)));
    }
  }, [dispatch, getOrgObjectPermissionsRS, objectKey]);

  useEffect(() => () => {
    dispatch(resetRequestStates([GET_ORG_OBJECT_PERMISSIONS]));
  }, [dispatch]);

  const onOpenPermissionsModal = () => setIsVisibleAssignPermissionsModal(true);
  const onClosePermissionsModal = () => setIsVisibleAssignPermissionsModal(false);

  if (organization) {

    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbItem>Permissions</CrumbItem>
        </Crumbs>
        <StackGrid>
          <Typography variant="h1">Permissions</Typography>
          <Typography>
            Below are the users and roles that are granted permissions on this object.
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
              isDataSet={false}
              isVisibleAssignPermissionsModal={isVisibleAssignPermissionsModal}
              objectKey={objectKey}
              onClosePermissionsModal={onClosePermissionsModal}
              organizationId={organizationId} />
        </StackGrid>
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgObjectPermissionsContainer;
