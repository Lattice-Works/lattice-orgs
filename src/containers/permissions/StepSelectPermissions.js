/*
 * @flow
 */

import React from 'react';

import _capitalize from 'lodash/capitalize';
import { faToggleOn } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Colors,
  IconButton,
  Select,
  Typography
} from 'lattice-ui-kit';
import type { PermissionType } from 'lattice';

import { PERMISSION_TYPE_RS_OPTIONS } from '~/common/constants';
import { SpaceBetweenGrid, StackGrid } from '~/components';
import type { ReactSelectOption } from '~/common/types';

const { NEUTRAL, PURPLE } = Colors;

const StepSelectPermissions = ({
  assignPermissionsToAllProperties,
  isDataSet,
  setAssignPermissionsToAllProperties,
  setTargetPermissionOptions,
  targetTitle,
  targetPermissionOptions,
} :{
  assignPermissionsToAllProperties :boolean;
  isDataSet :?boolean;
  setAssignPermissionsToAllProperties :(permissionsOnAllProperties :boolean) => void;
  setTargetPermissionOptions :(permissionTypes :ReactSelectOption<PermissionType>[]) => void;
  targetTitle :string;
  targetPermissionOptions :ReactSelectOption<PermissionType>[];
}) => {

  const permissions = targetPermissionOptions
    .map((option) => option.value)
    .map(_capitalize)
    .join(', ');

  const handleOnChange = (options :?ReactSelectOption<PermissionType>[]) => {
    if (!options) {
      setTargetPermissionOptions([]);
    }
    else {
      setTargetPermissionOptions(options);
    }
  };

  return (
    <StackGrid>
      <Typography>
        {`Select permissions to assign to "${targetTitle}".`}
      </Typography>
      <Select
          isMulti
          onChange={handleOnChange}
          options={PERMISSION_TYPE_RS_OPTIONS}
          value={targetPermissionOptions} />
      {
        isDataSet && (
          <>
            <Typography>
              You can assign permissions to either the data set and all columns, or just the data set itself.
              Permissions on individual columns can be assigned later.
            </Typography>
            <SpaceBetweenGrid>
              <Typography variant="body1">
                {`Assign ${permissions} to all columns:`}
              </Typography>
              <IconButton
                  aria-label="permissions toggle for all columns"
                  onClick={() => setAssignPermissionsToAllProperties(!assignPermissionsToAllProperties)}>
                <FontAwesomeIcon
                    color={assignPermissionsToAllProperties ? PURPLE.P300 : NEUTRAL.N500}
                    fixedWidth
                    icon={faToggleOn}
                    transform={{ rotate: assignPermissionsToAllProperties ? 0 : 180 }}
                    size="lg" />
              </IconButton>
            </SpaceBetweenGrid>
          </>
        )
      }
    </StackGrid>
  );
};

export default StepSelectPermissions;
