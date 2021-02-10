// @flow
import React from 'react';

// $FlowFixMe
import { Chip } from 'lattice-ui-kit';
import type { Role, UUID } from 'lattice';

import { ORG_ID_PARAM, ORG_ROLE, ROLE_ID_PARAM } from '../../core/router/Routes';

type Props = {
  onClick :(role :Role) => void;
  organizationId :UUID;
  role :Role;
  authorized :boolean;
};

const MemberRoleChip = ({
  authorized,
  onClick,
  organizationId,
  role,
} :Props) => {
  const roleId :UUID = role.id || '';
  const rolePath = ORG_ROLE
    .replace(ORG_ID_PARAM, organizationId)
    .replace(ROLE_ID_PARAM, roleId);

  const handleClick = (e :SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    onClick(role);
  };

  return (
    <Chip
        clickable
        component="a"
        href={`#${rolePath}`}
        label={role.title}
        onDelete={authorized ? handleClick : undefined} />
  );
};

export default MemberRoleChip;