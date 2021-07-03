/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { faEllipsisV } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, Set, get } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import {
  Checkbox,
  Colors,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from 'lattice-ui-kit';
import { Link } from 'react-router-dom';
import type { Role, UUID } from 'lattice';
import type { UserInfo } from 'lattice-auth';

import { getSecurablePrincipalId, getUserProfile } from '~/common/utils';
import { Routes } from '~/core/router';

import RoleChipsList from './RoleChipsList';

import AssignRolesToMembersModal from '../../components/AssignRolesToMembersModal';

const { NEUTRAL } = Colors;

const NO_ROLES_APPLIED = 'No Roles Applied';
const Row = styled.tr`
  height: 56px;
`;

const Cell = styled.td`
  border: 1px solid ${NEUTRAL.N100};
  max-width: 0;
  overflow: hidden;
  padding: ${(props) => (props.padding === 'small' ? '0 8px' : '0 16px')};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RolesWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const MemberLink = styled(Link)`
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

type Props = {
  currentRoleAuthorizations :Map;
  isOwner :boolean;
  member :Map;
  onRemoveMember :(member :Map) => void;
  onSelectMember :(member :Map) => void;
  onUnassign :(member :Map, role :Role) => void;
  organizationId :UUID;
  roles :Role[];
  selected :boolean;
};

const TableRow = ({
  currentRoleAuthorizations,
  isOwner,
  member,
  onRemoveMember,
  onSelectMember,
  onUnassign,
  organizationId,
  roles,
  selected,
} :Props) => {

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const { name, email, id } = getUserProfile(member);
  const memberRoles = get(member, 'roles');
  const memberRolesIds = Set(memberRoles.map((role) => get(role, 'id')));
  const orgRolesIds = Set(roles.map((role) => role.id));

  const identityProvider = member.getIn(['profile', 'identities', 0, 'provider'], '');

  const memberOrgRoleIds = orgRolesIds.intersect(memberRolesIds);
  const memberOrgRoles = roles.filter((role) => memberOrgRoleIds.includes(role.id));

  const handleButtonOnClick = (event :SyntheticEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuOnClose = () => {
    setMenuAnchorEl(null);
  };

  const handleRemoveMember = () => {
    handleMenuOnClose();
    onRemoveMember(member);
  };

  const handleSelectMember = () => {
    onSelectMember(member);
  };

  const handleAssignRoles = () => {
    handleMenuOnClose();
    setIsVisible(true);
  };

  const memberPrincipalId :?UUID = getSecurablePrincipalId(member);
  let memberPath = '#';
  if (memberPrincipalId) {
    memberPath = Routes.ORG_MEMBER
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.PRINCIPAL_ID_PARAM, memberPrincipalId);
  }

  const thisUserInfo :?UserInfo = AuthUtils.getUserInfo();
  const thisIsYou = id === thisUserInfo?.id;
  const isDeleteOptionDisabled = !isOwner && !thisIsYou;

  return (
    <Row>
      <Cell>
        <Checkbox checked={selected} onChange={handleSelectMember} />
      </Cell>
      <Cell as="th">
        <Typography align="left" noWrap>
          <MemberLink to={memberPath}>
            { name || email}
          </MemberLink>
        </Typography>
      </Cell>
      <Cell>
        <Typography noWrap>{identityProvider}</Typography>
      </Cell>
      <Cell padding="small">
        <RolesWrapper>
          {
            memberOrgRoles.length
              ? (
                <RoleChipsList
                    currentRoleAuthorizations={currentRoleAuthorizations}
                    deletable={isOwner}
                    member={member}
                    onUnassign={onUnassign}
                    organizationId={organizationId}
                    roles={memberOrgRoles} />
              )
              : <Typography color="textSecondary" noWrap>{NO_ROLES_APPLIED}</Typography>
          }
          <IconButton
              aria-controls="member-overflow-menu"
              aria-expanded={menuAnchorEl ? 'true' : false}
              aria-haspopup="menu"
              aria-label="member overflow button"
              onClick={handleButtonOnClick}
              variant="text">
            <FontAwesomeIcon fixedWidth icon={faEllipsisV} />
          </IconButton>
          <Menu
              anchorEl={menuAnchorEl}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
              }}
              elevation={4}
              getContentAnchorEl={null}
              id="member-overflow-menu"
              onClose={handleMenuOnClose}
              open={!!menuAnchorEl}
              transformOrigin={{
                horizontal: 'right',
                vertical: 'top',
              }}>
            <MenuItem onClick={handleAssignRoles}>
              Add role
            </MenuItem>
            <MenuItem disabled={isDeleteOptionDisabled} onClick={handleRemoveMember}>
              {
                thisIsYou ? 'Leave organization' : 'Delete person'
              }
            </MenuItem>
          </Menu>
          {
            isOwner && (
              <AssignRolesToMembersModal
                  isVisible={isVisible}
                  members={Map({ [id]: member })}
                  onClose={() => setIsVisible(false)}
                  organizationId={organizationId}
                  roles={roles}
                  shouldCloseOnOutsideClick={false}
                  textTitle="Add Roles"
                  withFooter={false} />
            )
          }
        </RolesWrapper>
      </Cell>
    </Row>
  );
};

export default TableRow;
