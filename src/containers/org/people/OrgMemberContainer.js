/*
 * @flow
 */

import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import styled from 'styled-components';
import { List, Map, fromJS } from 'immutable';
import { Types } from 'lattice';
import { AppContentWrapper, Modal, Typography } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, Principal, UUID } from 'lattice';

import { getPrincipal, getSecurablePrincipalId, getUserProfile } from '~/common/utils';
import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  StackGrid,
} from '~/components';
import {
  AssignPermissionsToDataSetModalBody,
  DataSetPermissionsContainer,
  PermissionsActionsGrid,
  PermissionsPanel,
} from '~/containers/permissions';
import {
  GET_CURRENT_ROLE_AUTHORIZATIONS,
  getCurrentRoleAuthorizations,
  resetCurrentRoleAuthorizations
} from '~/core/permissions/actions';
import { resetRequestStates } from '~/core/redux/actions';
import { selectOrganization, selectOrganizationMembers } from '~/core/redux/selectors';
import type { UserProfile } from '~/common/types';

import MemberRolesContainer from '../MemberRolesContainer';

const { PermissionTypes } = Types;

const getPanelColumnSize = ({ isVisiblePanelColumn }) => (
  isVisiblePanelColumn ? 'minmax(auto, 384px)' : 'auto'
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

const OrgMemberContainer = ({
  memberPrincipalId,
  peopleRoute,
  organizationId,
  organizationRoute,
} :{|
  memberPrincipalId :UUID;
  peopleRoute :string;
  organizationId :UUID;
  organizationRoute :string;
|}) => {
  const dispatch = useDispatch();

  const [filterByFlag, setFilterByFlag] = useState();
  const [filterByPermissionTypes, setFilterByPermissionTypes] = useState([]);
  const [filterByQuery, setFilterByQuery] = useState('');
  const [isVisibleAddDataSetModal, setIsVisibleAddDataSetModal] = useState(false);
  const [selection, setSelection] = useState();

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const orgMembers :List<Map> = useSelector(selectOrganizationMembers(organizationId));

  const roleAclKeys = fromJS(organization?.roles.reduce((aclKeys, role) => {
    aclKeys.push(role.aclKey);
    return aclKeys;
  }, []));

  const member :Map = useMemo(() => (
    orgMembers.find((orgMember :Map) => getSecurablePrincipalId(orgMember) === memberPrincipalId)
  ), [orgMembers, memberPrincipalId]);

  const memberUserProfile :UserProfile = useMemo(() => (
    getUserProfile(member)
  ), [member]);

  const memberPrincipal :?Principal = useMemo(() => (
    getPrincipal(member)
  ), [member]);

  useEffect(() => {
    dispatch(getCurrentRoleAuthorizations({
      aclKeys: roleAclKeys,
      permissions: [PermissionTypes.OWNER]
    }));

    return () => {
      dispatch(resetRequestStates([GET_CURRENT_ROLE_AUTHORIZATIONS]));
      dispatch(resetCurrentRoleAuthorizations());
    };
  }, [dispatch, roleAclKeys]);

  if (organization && memberPrincipal) {

    // TODO: this will need to be more fancy
    const memberName = memberUserProfile.name || memberUserProfile.email;

    const handleOnClosePermissionsPanel = () => {
      setSelection();
    };

    return (
      <>
        <AppContentGrid isVisiblePanelColumn={!!selection}>
          <ContentColumn>
            <AppContentWrapper>
              <Crumbs>
                <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
                <CrumbLink to={peopleRoute}>People</CrumbLink>
                <CrumbItem>{memberName}</CrumbItem>
              </Crumbs>
              <StackGrid gap={24}>
                <StackGrid>
                  <Typography variant="h1">{memberName}</Typography>
                  <Typography>
                    Below are all of the roles assigned to this member and data sets this member has permissions on.
                  </Typography>
                </StackGrid>
                <StackGrid>
                  <Typography variant="h2">Roles</Typography>
                  <MemberRolesContainer
                      member={member}
                      organizationId={organizationId}
                      roles={organization?.roles} />
                </StackGrid>
                <StackGrid>
                  <Typography variant="h2">Data Sets</Typography>
                  <Typography>Click on a dataset to manage permissions.</Typography>
                </StackGrid>
                <PermissionsActionsGrid
                    assignPermissionsText="Add dataset"
                    onChangeFilterByFlag={setFilterByFlag}
                    onChangeFilterByPermissionTypes={setFilterByPermissionTypes}
                    onChangeFilterByQuery={setFilterByQuery}
                    onClickAssignPermissions={() => setIsVisibleAddDataSetModal(true)} />
                <DataSetPermissionsContainer
                    filterByFlag={filterByFlag}
                    filterByPermissionTypes={filterByPermissionTypes}
                    filterByQuery={filterByQuery}
                    organizationId={organizationId}
                    onSelect={setSelection}
                    principal={memberPrincipal}
                    selection={selection} />
              </StackGrid>
            </AppContentWrapper>
          </ContentColumn>
          {
            selection && (
              <PanelColumn>
                <PermissionsPanel
                    dataSetId={selection.dataSetId}
                    key={`${selection.dataSetId}-${selection.permissionType}`}
                    onClose={handleOnClosePermissionsPanel}
                    organizationId={organizationId}
                    principal={memberPrincipal}
                    permissionType={selection.permissionType} />
              </PanelColumn>
            )
          }
        </AppContentGrid>
        <Modal
            isVisible={isVisibleAddDataSetModal}
            onClose={() => setIsVisibleAddDataSetModal(false)}
            shouldCloseOnOutsideClick={false}
            textTitle="Assign Permissions To Data Set"
            viewportScrolling
            withFooter={false}>
          <AssignPermissionsToDataSetModalBody
              onClose={() => setIsVisibleAddDataSetModal(false)}
              organizationId={organizationId}
              principal={memberPrincipal} />
        </Modal>
      </>
    );
  }

  return null;
};

export default OrgMemberContainer;
