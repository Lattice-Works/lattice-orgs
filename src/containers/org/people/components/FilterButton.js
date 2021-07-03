/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { faAngleDown } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, hasIn } from 'immutable';
import {
  Button,
  Checkbox,
  Menu,
  MenuItem,
  NestedMenuItem,
} from 'lattice-ui-kit';
import type { Role, UUID } from 'lattice';

import { ExternalLinkIcon } from '~/assets/svg/icons';
import { Routes } from '~/core/router';

import {
  AUTH0,
  AUTHORIZATION,
  ROLE,
  SAML,
  SOCIAL
} from '../utils/constants';

const ChevronDown = <FontAwesomeIcon icon={faAngleDown} />;
const LinkIcon = styled(ExternalLinkIcon)`
  margin-right: 8px;
`;

const SlimMenuItem = styled(MenuItem)`
  padding: 0 16px;
`;

const FilterItem = styled.div`
  align-items: center;
  display: flex;
  flex: 0 1 100%;
  justify-content: space-between;

  > :first-child {
    margin-right: 16px;
  }
`;

type Props = {
  filter :Map;
  onFilterChange :(category :string, value :string) => void;
  organizationId :UUID;
  roles :Role[];
};

const FilterButton = ({
  filter,
  onFilterChange,
  organizationId,
  roles,
} :Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const rolesPath = Routes.ORG_ROLES.replace(Routes.ORG_ID_PARAM, organizationId);

  const handleButtonOnClick = (event :SyntheticEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuOnClose = () => {
    setMenuAnchorEl(null);
  };

  const handleOnFilterChange = (event :SyntheticEvent<HTMLLIElement>) => {
    const { category, value } = event.currentTarget.dataset;
    onFilterChange(category, value);
  };

  return (
    <>
      <Button
          endIcon={ChevronDown}
          onClick={handleButtonOnClick}
          variant="text">
        Filter
      </Button>
      <Menu
          anchorEl={menuAnchorEl}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom',
          }}
          elevation={4}
          getContentAnchorEl={null}
          id="filter-menu"
          onClose={handleMenuOnClose}
          open={!!menuAnchorEl}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top',
          }}>
        <NestedMenuItem
            elevation={4}
            label="Role"
            parentMenuOpen={!!menuAnchorEl}>
          {
            roles.map((role, index) => {
              const roleId :UUID = role.id || '';
              const key = `filter-${roleId || index}`;
              const lastItem = index === roles.length - 1;
              const checked = hasIn(filter, [ROLE, roleId]);
              return (
                <SlimMenuItem
                    data-category={ROLE}
                    data-value={roleId}
                    divider={lastItem}
                    key={key}
                    onClick={handleOnFilterChange}>
                  <FilterItem>
                    <span>{role.title}</span>
                    <Checkbox
                        checked={checked}
                        readOnly />
                  </FilterItem>
                </SlimMenuItem>
              );
            })
          }
          <MenuItem component="a" href={`#${rolesPath}`}>
            <LinkIcon />
            Manage Roles
          </MenuItem>
        </NestedMenuItem>
        <NestedMenuItem
            elevation={4}
            label="Authorization"
            parentMenuOpen={!!menuAnchorEl}>
          <SlimMenuItem
              data-category={AUTHORIZATION}
              data-value={AUTH0}
              onClick={handleOnFilterChange}>
            <FilterItem>
              <span>Auth0</span>
              <Checkbox
                  checked={hasIn(filter, [AUTHORIZATION, AUTH0])}
                  readOnly />
            </FilterItem>
          </SlimMenuItem>
          <SlimMenuItem
              data-category={AUTHORIZATION}
              data-value={SAML}
              onClick={handleOnFilterChange}>
            <FilterItem>
              <span>SAML</span>
              <Checkbox
                  checked={hasIn(filter, [AUTHORIZATION, SAML])}
                  readOnly />
            </FilterItem>
          </SlimMenuItem>
          <SlimMenuItem
              data-category={AUTHORIZATION}
              data-value={SOCIAL}
              onClick={handleOnFilterChange}>
            <FilterItem>
              <span>Social</span>
              <Checkbox
                  checked={hasIn(filter, [AUTHORIZATION, SOCIAL])}
                  readOnly />
            </FilterItem>
          </SlimMenuItem>
        </NestedMenuItem>
      </Menu>
    </>
  );
};

FilterButton.defaultProps = {
  filter: Map()
};

export default FilterButton;
