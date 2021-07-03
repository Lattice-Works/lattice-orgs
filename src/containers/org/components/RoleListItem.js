/*
 * @flow
 */

import React from 'react';

import {
  Avatar,
  Checkbox,
  ListItem,
  ListItemAvatar,
  Typography,
} from 'lattice-ui-kit';
import type { Role } from 'lattice';

import StyledListItemSecondaryAction from './styled/StyledListItemSecondaryAction';

type Props = {
  checked :boolean;
  disabled :boolean;
  onSecondaryChange :(role :Role) => void;
  role :Role;
};

const RoleListItem = ({
  checked,
  disabled,
  onSecondaryChange,
  role,
  ...rest
} :Props) => {

  const handleCheckboxChange = () => {
    onSecondaryChange(role);
  };

  const color = disabled ? 'textSecondary' : 'textPrimary';

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ListItem {...rest}>
      <ListItemAvatar>
        <Avatar>{role.title[0].toUpperCase()}</Avatar>
      </ListItemAvatar>
      <Typography color={color} variant="body2">{role.title}</Typography>
      <StyledListItemSecondaryAction>
        <Checkbox checked={checked} disabled={disabled} onChange={handleCheckboxChange} />
      </StyledListItemSecondaryAction>
    </ListItem>
  );
};

export default RoleListItem;
