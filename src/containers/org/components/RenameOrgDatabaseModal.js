/*
 * @flow
 */

import React, { useState } from 'react';

import { OrganizationsApiActions } from 'lattice-sagas';
import { ActionModal, Input, Typography } from 'lattice-ui-kit';
import { LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ORGANIZATIONS } from '~/common/constants';
import { ModalBody, ResetOnUnmount, StackGrid } from '~/components';

const { RENAME_ORGANIZATION_DATABASE, renameOrganizationDatabase } = OrganizationsApiActions;

const { isNonEmptyString } = LangUtils;

const RESET_ACTIONS = [RENAME_ORGANIZATION_DATABASE];

const RenameOrgDatabaseModal = ({
  isVisible,
  onClose,
  organizationId,
} :{|
  isVisible :boolean;
  onClose :() => void;
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();

  const [isValidDatabaseName, setIsValidDatabaseName] = useState(true);
  const [databaseName, setDatabaseName] = useState('');

  const renameRS :?RequestState = useRequestState([ORGANIZATIONS, RENAME_ORGANIZATION_DATABASE]);

  const handleOnClickPrimary = () => {
    if (isNonEmptyString(databaseName)) {
      dispatch(
        renameOrganizationDatabase({
          databaseName,
          organizationId,
        })
      );
    }
    else {
      setIsValidDatabaseName(false);
    }
  };

  const handleOnChangeDatabaseName = (event :SyntheticEvent<HTMLInputElement>) => {
    setIsValidDatabaseName(true);
    setDatabaseName(event.currentTarget.value);
  };

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBody>
        <StackGrid>
          <Typography>Enter a new database name.</Typography>
          <Input
              error={!isValidDatabaseName}
              onChange={handleOnChangeDatabaseName}
              required
              value={databaseName} />
        </StackGrid>
      </ModalBody>
    ),
    [RequestStates.SUCCESS]: (
      <ResetOnUnmount actions={RESET_ACTIONS}>
        <Typography>Success!</Typography>
      </ResetOnUnmount>
    ),
    [RequestStates.FAILURE]: (
      <ResetOnUnmount actions={RESET_ACTIONS}>
        <Typography>Failed to rename database. Please try again.</Typography>
      </ResetOnUnmount>
    ),
  };

  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnClickPrimary}
        onClose={onClose}
        requestState={renameRS}
        requestStateComponents={rsComponents}
        textPrimary="Submit"
        textSecondary="Cancel"
        textTitle="Rename Database" />
  );
};

export default RenameOrgDatabaseModal;
