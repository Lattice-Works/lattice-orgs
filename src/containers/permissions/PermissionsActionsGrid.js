/*
 * @flow
 */

import React from 'react';
import type { ComponentType } from 'react';

import _debounce from 'lodash/debounce';
import _isFunction from 'lodash/isFunction';
import styled from 'styled-components';
import { faChevronDown } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  CheckboxSelect,
  Collapse,
  IconButton,
  SearchInput,
  Select,
  Typography,
} from 'lattice-ui-kit';
import { useBoolean } from 'lattice-utils';
import type { PermissionType } from 'lattice';

import { ES_FLAG_TYPE_RS_OPTIONS, PERMISSION_TYPE_RS_OPTIONS } from '~/common/constants';
import {
  ActionsGrid,
  Flip,
  GapGrid,
  PlusButton,
  StackGrid,
} from '~/components';
import type { ReactSelectOption } from '~/common/types';
import type { ActionsGridProps } from '~/components';

const StyledActionsGrid :ComponentType<ActionsGridProps> = styled(ActionsGrid)`
  grid-template-columns: 2fr minmax(200px, 1fr) auto;
`;

const PermissionsActionsGrid = ({
  assignPermissionsText,
  onChangeFilterByFlag,
  onChangeFilterByPermissionTypes,
  onChangeFilterByQuery,
  onClickAssignPermissions,
} :{|
  assignPermissionsText :string;
  onChangeFilterByFlag ?:(flag :?string) => void;
  onChangeFilterByPermissionTypes :(permissionTypes :PermissionType[]) => void;
  onChangeFilterByQuery :(query :string) => void;
  onClickAssignPermissions :() => void;
|}) => {

  const [isOpenSearchOptions, openSearchOptions, closeSearchOptions] = useBoolean();

  const debounceFilterByQuery = _debounce((query :string) => {
    if (_isFunction(onChangeFilterByQuery)) {
      onChangeFilterByQuery(query);
    }
  }, 250);

  const handleOnChangeFilterQuery = (event :SyntheticInputEvent<HTMLInputElement>) => {
    debounceFilterByQuery(event.target.value || '');
  };

  const handleOnChangeSelect = (options :?ReactSelectOption<PermissionType>[]) => {
    if (_isFunction(onChangeFilterByPermissionTypes)) {
      if (!options) {
        onChangeFilterByPermissionTypes([]);
      }
      else {
        onChangeFilterByPermissionTypes(options.map((option) => option.value));
      }
    }
  };

  const handleOnClickPlusButton = () => {
    if (_isFunction(onClickAssignPermissions)) {
      onClickAssignPermissions();
    }
  };

  const handleOnChangeFlag = (option :?ReactSelectOption<string>) => {
    if (_isFunction(onChangeFilterByFlag)) {
      onChangeFilterByFlag(option?.value);
    }
  };

  const toggleSearchOptions = () => (
    isOpenSearchOptions ? closeSearchOptions() : openSearchOptions()
  );

  return (
    <StackGrid gap={8}>
      <StyledActionsGrid>
        <SearchInput onChange={handleOnChangeFilterQuery} />
        <CheckboxSelect
            hideSelectedOptions
            isClearable
            onChange={handleOnChangeSelect}
            options={PERMISSION_TYPE_RS_OPTIONS}
            placeholder="Filter by permission" />
        <PlusButton aria-label="assign permissions" onClick={handleOnClickPlusButton}>
          <Typography component="span">{assignPermissionsText}</Typography>
        </PlusButton>
      </StyledActionsGrid>
      {
        _isFunction(onChangeFilterByFlag) && (
          <>
            <GapGrid gap={8}>
              <Typography variant="subtitle2">Filter Options</Typography>
              <Flip flip={isOpenSearchOptions}>
                <IconButton aria-label="toggle search options" onClick={toggleSearchOptions}>
                  <FontAwesomeIcon fixedWidth icon={faChevronDown} size="xs" />
                </IconButton>
              </Flip>
            </GapGrid>
            <Collapse in={isOpenSearchOptions}>
              <Box maxWidth={240}>
                <Typography gutterBottom variant="subtitle1">Flags</Typography>
                <Select
                    isClearable
                    onChange={handleOnChangeFlag}
                    options={ES_FLAG_TYPE_RS_OPTIONS} />
              </Box>
            </Collapse>
          </>
        )
      }
    </StackGrid>
  );
};

PermissionsActionsGrid.defaultProps = {
  onChangeFilterByFlag: undefined,
};

export default PermissionsActionsGrid;
