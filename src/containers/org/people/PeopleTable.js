/*
 * @flow
 */

import React, { useCallback, useReducer, useState } from 'react';

import debounce from 'lodash/debounce';
import styled from 'styled-components';
import { faPlus } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map, Set } from 'immutable';
import {
  Button,
  Checkbox,
  Colors,
  PaginationToolbar,
  SearchInput,
} from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { Role, UUID } from 'lattice';

import { FILTER, PAGE } from '~/common/constants';
import { getUserProfile } from '~/common/utils';
import { selectCurrentRoleAuthorizations } from '~/core/redux/selectors';

import BulkActionButton from './components/BulkActionButton';
import FilterButton from './components/FilterButton';
import FilterChipsList from './components/FilterChipsList';
import TableRow from './components/TableRow';
import memberHasSelectedIdentityTypes from './utils/memberHasSelectedIdentityTypes';
import memberHasSelectedRoles from './utils/memberHasSelectedRoles';

import AddMembersToOrganizationModal from '../components/AddMembersToOrganizationModal';
import AssignRolesToMembersModal from '../components/AssignRolesToMembersModal';
import { RemoveMemberFromOrgModal, RemoveRoleFromMemberModal } from '../components';
import { filterOrganizationMember } from '../utils';

const { NEUTRAL } = Colors;
const { pagination } = ReduxUtils;

const TableToolbar = styled.div`
  align-items: center;
  display: grid;
  grid-gap: 8px;
  grid-template-columns: minmax(160px, max-content) 160px 1fr 100px 160px;
  margin: 16px 0;
`;

const MembersCheckboxWrapper = styled.div`
  margin: 0 8px 0 17px;
`;

const Table = styled.table`
  border: 1px solid ${NEUTRAL.N100};
  border-collapse: collapse;
  width: 100%;
`;

const Selection = styled.span`
  margin-left: 10px;
  vertical-align: middle;
`;

const PlusIcon = <FontAwesomeIcon icon={faPlus} size="lg" />;

const MAX_PER_PAGE = 20;

type Props = {
  isOwner :boolean;
  members :List;
  organizationId :UUID;
  roles :Role[];
};

const PeopleTable = ({
  isOwner,
  members,
  organizationId,
  roles,
} :Props) => {

  const currentRoleAuthorizations :Map = useSelector(selectCurrentRoleAuthorizations());
  // consider using reducers for handling member/role/action selection
  const [isVisibleRemoveMemberFromOrgModal, setIsVisibleRemoveMemberFromOrgModal] = useState(false);
  const [isVisibleRemoveRoleFromMemberModal, setIsVisibleRemoveRoleFromMemberModal] = useState(false);
  const [isVisibleAddMembersToOrganizationModal, setIsVisibleAddMembersToOrganizationModal] = useState(false);
  const [isVisibleAssignRolesModal, setIsVisibleAssignRolesModal] = useState(false);
  const [paginationState, paginationDispatch] = useReducer(pagination.reducer, pagination.INITIAL_STATE);
  const [targetMember, setTargetMember] = useState();
  const [targetRole, setTargetRole] = useState();
  const [selectedFilters, setSelectedFilters] = useState(Map({
    role: Set(),
    authorization: Set(),
  }));
  const [selectedMembers, setSelectedMembers] = useState(Map());

  let filteredMembers = members;
  // filter by query
  if (paginationState.query) {
    filteredMembers = filteredMembers.filter((member) => filterOrganizationMember(member, paginationState.query));
  }
  // filter by selected roles
  filteredMembers = filteredMembers
    .filter((member) => memberHasSelectedRoles(member, selectedFilters.get('role', Set())));
  // filter by selected authorization
  filteredMembers = filteredMembers
    .filter((member) => memberHasSelectedIdentityTypes(member, selectedFilters.get('authorization', Set())));

  const filteredMembersCount = filteredMembers.count();
  const pageMembers = filteredMembers.slice(paginationState.start, paginationState.start + MAX_PER_PAGE);

  const handleOnPageChange = ({ page, start }) => {
    paginationDispatch({ type: PAGE, page, start });
  };

  const debouncedFilterQuery = useCallback(debounce(
    (query = '') => paginationDispatch({ type: FILTER, query }),
    250
  ), []);

  const handleOnChangeMemberFilterQuery = (event :SyntheticInputEvent<HTMLInputElement>) => {
    debouncedFilterQuery(event.target.value);
  };

  const handleUnassignRole = (member :Map, role :Role) => {
    setTargetMember(member);
    setTargetRole(role);
    setIsVisibleRemoveRoleFromMemberModal(true);
  };

  const handleUnassignAllRoles = () => {
    // TODO: unassign all roles from target member
  };

  const handleRemoveMember = (member :Map) => {
    setTargetMember(member);
    setIsVisibleRemoveMemberFromOrgModal(true);
  };

  const handleAddMember = () => {
    setIsVisibleAddMembersToOrganizationModal(true);
  };

  const handleOnFilterChange = (category :string, id :string) => {
    const categoryFilters = selectedFilters.get(category, Set());
    const newFilters = categoryFilters.includes(id)
      ? categoryFilters.remove(id)
      : categoryFilters.add(id);

    setSelectedFilters(selectedFilters.set(category, newFilters));
  };

  const handleSelectMember = (member :Map) => {
    const { id } = getUserProfile(member);
    const newSelection = selectedMembers.has(id)
      ? selectedMembers.remove(id)
      : selectedMembers.set(id, member);
    setSelectedMembers(newSelection);
  };

  const onSelectAll = () => {
    const newSelection = Map().withMutations((mutable) => {
      filteredMembers.forEach((member) => {
        const { id } = getUserProfile(member);
        mutable.set(id, member);
      });
    });

    setSelectedMembers(newSelection);
  };

  const onDeselectAll = () => {
    setSelectedMembers(Map());
  };

  const selectionText = selectedMembers.size
    ? `${selectedMembers.size} selected`
    : `${filteredMembers.size} members`;

  return (
    <div>
      <TableToolbar>
        <MembersCheckboxWrapper>
          {/* TODO: Support indeterminate checkbox state */}
          <Checkbox
              checked={selectedMembers.size}
              onChange={selectedMembers.size ? onDeselectAll : onSelectAll} />
          <Selection>{selectionText}</Selection>
        </MembersCheckboxWrapper>
        <BulkActionButton onAddRolesClick={() => setIsVisibleAssignRolesModal(true)} />
        <SearchInput onChange={handleOnChangeMemberFilterQuery} />
        <FilterButton
            filter={selectedFilters}
            onFilterChange={handleOnFilterChange}
            organizationId={organizationId}
            roles={roles} />
        <Button
            color="primary"
            onClick={handleAddMember}
            startIcon={PlusIcon}>
          Add Member
        </Button>
      </TableToolbar>
      <FilterChipsList
          filters={selectedFilters}
          onDelete={handleOnFilterChange}
          roles={roles} />
      <Table cellPadding="0" cellSpacing="0">
        <colgroup>
          <col width="56px" />
          <col width="268px" />
          <col width="150px" />
        </colgroup>
        <tbody>
          {
            pageMembers.map((member) => {
              const { id } = getUserProfile(member);
              return (
                <TableRow
                    currentRoleAuthorizations={currentRoleAuthorizations}
                    isOwner={isOwner}
                    key={id}
                    member={member}
                    onRemoveMember={handleRemoveMember}
                    onSelectMember={handleSelectMember}
                    onUnassign={handleUnassignRole}
                    onUnassignAll={handleUnassignAllRoles}
                    organizationId={organizationId}
                    roles={roles}
                    selected={selectedMembers.has(id)} />
              );
            })
          }
        </tbody>
      </Table>
      <PaginationToolbar
          count={filteredMembersCount}
          onPageChange={handleOnPageChange}
          page={paginationState.page}
          rowsPerPage={MAX_PER_PAGE} />
      <RemoveMemberFromOrgModal
          isVisible={isVisibleRemoveMemberFromOrgModal}
          member={targetMember}
          onClose={() => setIsVisibleRemoveMemberFromOrgModal(false)}
          organizationId={organizationId} />
      {
        isOwner && targetRole && (
          <RemoveRoleFromMemberModal
              isVisible={isVisibleRemoveRoleFromMemberModal}
              member={targetMember}
              onClose={() => setIsVisibleRemoveRoleFromMemberModal(false)}
              organizationId={organizationId}
              role={targetRole} />
        )
      }
      {
        isOwner && (
          <AddMembersToOrganizationModal
              isVisible={isVisibleAddMembersToOrganizationModal}
              members={members}
              onClose={() => setIsVisibleAddMembersToOrganizationModal(false)}
              organizationId={organizationId} />
        )
      }
      {
        isOwner && (
          <AssignRolesToMembersModal
              isVisible={isVisibleAssignRolesModal}
              members={selectedMembers}
              onClose={() => setIsVisibleAssignRolesModal(false)}
              organizationId={organizationId}
              roles={roles}
              shouldCloseOnOutsideClick={false}
              textTitle="Add Roles"
              withFooter={false} />
        )
      }
    </div>
  );
};

PeopleTable.defaultProps = {
  members: List()
};

export default PeopleTable;
