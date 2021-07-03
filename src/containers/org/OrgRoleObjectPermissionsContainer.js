/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import { List } from 'immutable';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, Role, UUID } from 'lattice';
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
import { GET_ORG_ROLE_OBJECT_PERMISSIONS, getOrgRoleObjectPermissions } from '~/core/permissions/actions';
import { resetRequestStates } from '~/core/redux/actions';
import { selectOrganization } from '~/core/redux/selectors';

const OrgRoleObjectPermissionsContainer = ({
  organizationId,
  organizationRoute,
  roleId,
  roleRoute,
  rolesRoute,
} :{
  organizationId :UUID;
  organizationRoute :string;
  roleId :UUID;
  roleRoute :string;
  rolesRoute :string;
}) => {

  const dispatch = useDispatch();

  const [filterByPermissionTypes, setFilterByPermissionTypes] = useState([]);
  const [filterByQuery, setFilterByQuery] = useState('');
  const [isVisibleAssignPermissionsModal, setIsVisibleAssignPermissionsModal] = useState(false);

  const getOrgRoleObjectPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_ORG_ROLE_OBJECT_PERMISSIONS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const role :?Role = useMemo(() => (
    organization?.roles.find((orgRole) => orgRole.id === roleId)
  ), [organization, roleId]);

  const objectKey = useMemo(() => List([organizationId, roleId]), [organizationId, roleId]);

  useEffect(() => {
    if (getOrgRoleObjectPermissionsRS === RequestStates.STANDBY) {
      dispatch(getOrgRoleObjectPermissions(List().push(objectKey)));
    }
  }, [dispatch, getOrgRoleObjectPermissionsRS, objectKey]);

  useEffect(() => () => {
    dispatch(resetRequestStates([GET_ORG_ROLE_OBJECT_PERMISSIONS]));
  }, [dispatch]);

  const onOpenPermissionsModal = () => setIsVisibleAssignPermissionsModal(true);
  const onClosePermissionsModal = () => setIsVisibleAssignPermissionsModal(false);

  if (organization && role) {

    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbLink to={rolesRoute}>Roles</CrumbLink>
          <CrumbLink to={roleRoute}>{role.title || 'Role'}</CrumbLink>
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

export default OrgRoleObjectPermissionsContainer;
