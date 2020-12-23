/*
 * @flow
 */

import React, { useReducer, useState } from 'react';

import styled from 'styled-components';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
import { faPlus } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import {
  Button,
  IconButton,
  PaginationToolbar,
  SearchInput,
} from 'lattice-ui-kit';
import { PersonUtils } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import type { Role, UUID } from 'lattice';

import AddMemberToOrgModal from '../components/AddMemberToOrgModal';
import AssignRoleToMemberModal from '../components/AssignRoleToMemberModal';
import { Header } from '../../../components';
import { Routes } from '../../../core/router';
import { goToRoute } from '../../../core/router/actions';
import { getSecurablePrincipalId, getUserTitle } from '../../../utils';
import {
  FILTER,
  INITIAL_PAGINATION_STATE,
  PAGE,
  paginationReducer,
} from '../../../utils/stateReducers/pagination';
import { RemoveMemberFromOrgModal, RemoveRoleFromMemberModal } from '../components';
import { filterOrganizationMember, isRoleAssignedToMember } from '../utils';

const { getUserId } = PersonUtils;

const ALL_MEMBERS_HEADER = 'All Members';
const MAX_PER_PAGE = 20;

const MembersSectionGrid = styled.div`
  display: grid;
  grid-auto-rows: min-content;
  grid-gap: 16px;
  grid-template-columns: 1fr;
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: 1fr auto auto;
`;

const MembersSectionHeader = styled(Header)`
  justify-content: space-between;
  line-height: 48px;
`;

const MemberWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
`;

const MemberLink = styled(Link)`
  color: inherit;
  text-decoration: none;

  &:focus {
    outline: none;
    text-decoration: underline;
  }
`;

const PlusIcon = (
  <FontAwesomeIcon fixedWidth icon={faPlus} size="xs" />
);

type Props = {
  isOwner :boolean;
  members :List;
  organizationId :UUID;
  selectedRole :?Role;
};

const MembersSection = ({
  isOwner,
  members,
  organizationId,
  selectedRole,
} :Props) => {

  const dispatch = useDispatch();

  const [isVisibleRemoveMemberFromOrgModal, setIsVisibleRemoveMemberFromOrgModal] = useState(false);
  const [isVisibleRemoveRoleFromMemberModal, setIsVisibleRemoveRoleFromMemberModal] = useState(false);
  const [isVisibleAddMemberToOrgModal, setIsVisibleAddMemberToOrgModal] = useState(false);
  const [isVisibleAssignRoleModal, setIsVisibleAssignRoleModal] = useState(false);
  const [paginationState, paginationDispatch] = useReducer(paginationReducer, INITIAL_PAGINATION_STATE);
  const [targetMember, setTargetMember] = useState();

  const handleOnClickRemoveMember = (member :Map) => {
    setTargetMember(member);
    if (selectedRole) {
      setIsVisibleRemoveRoleFromMemberModal(true);
    }
    else {
      setIsVisibleRemoveMemberFromOrgModal(true);
    }
  };

  const handleOnChangeMemberFilterQuery = (event :SyntheticInputEvent<HTMLInputElement>) => {
    paginationDispatch({ type: FILTER, query: event.target.value || '' });
  };

  const handleOnPageChange = ({ page, start }) => {
    paginationDispatch({ type: PAGE, page, start });
  };

  const goToRole = () => {
    if (selectedRole && selectedRole.id) {
      const roleId :UUID = selectedRole.id;
      const rolePath = Routes.ORG_ROLE
        .replace(Routes.ORG_ID_PARAM, organizationId)
        .replace(Routes.ROLE_ID_PARAM, roleId);
      dispatch(goToRoute(rolePath));
    }
  };

  const thisUserInfo = AuthUtils.getUserInfo() || { id: '' };
  const thisUserId = thisUserInfo.id;

  let filteredMembers = members;
  let memberSectionHeader = ALL_MEMBERS_HEADER;
  if (selectedRole) {
    filteredMembers = filteredMembers.filter((member) => isRoleAssignedToMember(member, selectedRole.id));
    memberSectionHeader = selectedRole.title;
  }
  if (paginationState.query) {
    filteredMembers = filteredMembers.filter((member) => filterOrganizationMember(member, paginationState.query));
  }
  const filteredMembersCount = filteredMembers.count();
  const pageMembers = filteredMembers.slice(paginationState.start, paginationState.start + MAX_PER_PAGE);

  const disableAddMember = selectedRole ? false : !isOwner;

  const handleAddMemberOnClick = () => {
    if (selectedRole) {
      setIsVisibleAssignRoleModal(true);
    }
    else {
      setIsVisibleAddMemberToOrgModal(true);
    }
  };

  return (
    <MembersSectionGrid>
      <MembersSectionHeader as="h4">
        <span>{memberSectionHeader}</span>
      </MembersSectionHeader>
      <ControlsGrid>
        <SearchInput onChange={handleOnChangeMemberFilterQuery} placeholder="Filter members" />
        <Button
            color="primary"
            disabled={disableAddMember}
            onClick={handleAddMemberOnClick}
            startIcon={PlusIcon}>
          Add Member
        </Button>
        {
          selectedRole && (
            <Button onClick={goToRole}>Manage Role</Button>
          )
        }
      </ControlsGrid>
      {
        filteredMembersCount > MAX_PER_PAGE && (
          <PaginationToolbar
              count={filteredMembersCount}
              onPageChange={handleOnPageChange}
              page={paginationState.page}
              rowsPerPage={MAX_PER_PAGE} />
        )
      }
      {
        pageMembers.map((member) => {
          const userId = getUserId(member);
          const memberPrincipalId :?UUID = getSecurablePrincipalId(member);
          let memberPath = '#';
          if (memberPrincipalId) {
            memberPath = Routes.ORG_MEMBER
              .replace(Routes.ORG_ID_PARAM, organizationId)
              .replace(Routes.PRINCIPAL_ID_PARAM, memberPrincipalId);
          }
          return (
            <MemberWrapper key={userId}>
              <MemberLink to={memberPath}>
                {getUserTitle(member, thisUserId)}
              </MemberLink>
              <IconButton onClick={() => handleOnClickRemoveMember(member)}>
                <FontAwesomeIcon fixedWidth icon={faTimes} />
              </IconButton>
            </MemberWrapper>
          );
        })
      }
      {
        isOwner && (
          <RemoveMemberFromOrgModal
              isVisible={isVisibleRemoveMemberFromOrgModal}
              member={targetMember}
              onClose={() => setIsVisibleRemoveMemberFromOrgModal(false)}
              organizationId={organizationId} />
        )
      }
      {
        isOwner && (
          <AddMemberToOrgModal
              isVisible={isVisibleAddMemberToOrgModal}
              member={targetMember}
              onClose={() => setIsVisibleAddMemberToOrgModal(false)}
              organizationId={organizationId} />
        )
      }
      {
        isOwner && selectedRole && (
          <RemoveRoleFromMemberModal
              isVisible={isVisibleRemoveRoleFromMemberModal}
              member={targetMember}
              onClose={() => setIsVisibleRemoveRoleFromMemberModal(false)}
              organizationId={organizationId}
              role={selectedRole} />
        )
      }
      {
        isOwner && selectedRole && (
          <AssignRoleToMemberModal
              isVisible={isVisibleAssignRoleModal}
              members={members}
              onClose={() => setIsVisibleAssignRoleModal(false)}
              organizationId={organizationId}
              role={selectedRole} />
        )
      }
    </MembersSectionGrid>
  );
};

export default MembersSection;
