/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Chip, Typography } from 'lattice-ui-kit';
import type { Role } from 'lattice';

import {
  AUTH0,
  AUTHORIZATION,
  ROLE,
  SAML,
  SOCIAL
} from '../utils/constants';

const ChipsList = styled.div`
  display: flex;
  flex: 1;
  overflow: scroll;
  margin-bottom: 16px;

  > :not(:first-child) {
    margin-left: 4px;
  }
`;

const AUTH_MAP = {
  [AUTH0]: AUTH0.replace(/^\w/, (c) => c.toUpperCase()),
  [SOCIAL]: SOCIAL.replace(/^\w/, (c) => c.toUpperCase()),
  [SAML]: SAML.toUpperCase()
};

type ChipLabelProps = {
  category :string;
  title :string;
};

const ChipLabel = ({
  category,
  title
} :ChipLabelProps) => (
  <span>
    <Typography component="span" variant="body2">{`${category}: `}</Typography>
    <Typography component="span">{title}</Typography>
  </span>
);

type FilterChipsListProps = {
  filters :Map;
  onDelete :(category :string, id :string) => void;
  roles :Role[];
};

const FilterChipsList = ({
  filters,
  onDelete,
  roles
} :FilterChipsListProps) => (
  <ChipsList>
    {
      filters.get(AUTHORIZATION).map((filter) => {
        const title = AUTH_MAP[filter] || filter;
        const label = <ChipLabel category="Authorization" title={title} />;
        return (
          <Chip
              key={`${AUTHORIZATION}-filter-${filter}`}
              label={label}
              variant="outline"
              onDelete={() => onDelete(AUTHORIZATION, filter)} />
        );
      })
    }
    {
      filters.get(ROLE).map((filter) => {
        const title = roles.find((role) => role.id === filter)?.title || filter;
        const label = <ChipLabel category="Role" title={title} />;
        return (
          <Chip
              key={`${ROLE}-filter-${filter}`}
              label={label}
              variant="outline"
              onDelete={() => onDelete(ROLE, filter)} />
        );
      })
    }
  </ChipsList>
);

export default FilterChipsList;
