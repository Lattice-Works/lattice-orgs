/*
 * @flow
 */

import React, { useRef, useState } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Types } from 'lattice';
import { Chip } from 'lattice-ui-kit';
import type { Role, UUID } from 'lattice';

import RoleOverflowPopover from './RoleOverflowPopover';
import usePriorityVisibility from './usePriorityVisibility';

import MemberRoleChip from '../../MemberRoleChip';
import { getUserProfile } from '~/common/utils';

const { PermissionTypes } = Types;

const ChipsList = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;

  > :not(:first-child) {
    margin-left: 4px;
  }
`;

type Props = {
  currentRoleAuthorizations :Map;
  member :Map;
  onUnassign :(member :Map, role :Role) => void;
  organizationId :UUID;
  roles :Role[];
};

const RoleChipsList = ({
  currentRoleAuthorizations,
  member,
  onUnassign,
  organizationId,
  roles,
} :Props) => {
  const chipListRef = useRef(null);
  const [overflowAnchorEl, setOverflowAnchorEl] = useState(null);

  const [priority, remainder] = usePriorityVisibility(chipListRef, roles, 4, 52);

  const handleOverflowClick = (event) => {
    setOverflowAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setOverflowAnchorEl(null);
  };

  const { id } = getUserProfile(member);
  const handleDelete = (role :Role) => {
    handleClose();
    onUnassign(member, role);
  };

  return (
    <>
      <ChipsList ref={chipListRef}>
        {
          priority.map((role, index) => {
            const authorized = currentRoleAuthorizations.getIn([List(role.aclKey), PermissionTypes.OWNER], false);
            const roleId :UUID = role.id || '';
            const key = `${id}-${roleId || index}`;

            return (
              <MemberRoleChip
                  authorized={authorized}
                  key={key}
                  onClick={handleDelete}
                  organizationId={organizationId}
                  role={role} />
            );
          })
        }
        {
          !!remainder.length && (
            <>
              <Chip
                  clickable
                  label={`+${remainder.length}`}
                  onClick={handleOverflowClick}
                  variant="outline" />
              <RoleOverflowPopover
                  anchorEl={overflowAnchorEl}
                  currentRoleAuthorizations={currentRoleAuthorizations}
                  handleDelete={handleDelete}
                  onClose={handleClose}
                  open={!!overflowAnchorEl}
                  organizationId={organizationId}
                  roles={remainder} />
            </>
          )
        }
      </ChipsList>
    </>
  );
};

export default RoleChipsList;
