/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import { Set } from 'immutable';
import { ActionModal, Input, Label } from 'lattice-ui-kit';
import { LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, Role, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ORGANIZATIONS } from '~/common/constants';
import { ModalBody } from '~/components';
import { resetRequestStates } from '~/core/redux/actions';

import { ADD_ROLE_TO_ORGANIZATION, addRoleToOrganization } from '../actions';

const { isNonEmptyString } = LangUtils;

type Props = {
  isVisible :boolean;
  onClose :() => void;
  organization :Organization;
  organizationId :UUID;
};

const AddRoleToOrgModal = ({
  isVisible,
  onClose,
  organization,
  organizationId,
} :Props) => {

  const dispatch = useDispatch();

  const [isValidRoleTitle, setIsValidRoleTitle] = useState(true);
  const [roleDescription, setRoleDescription] = useState('');
  const [roleTitle, setRoleTitle] = useState('');

  const addRoleRS :?RequestState = useRequestState([ORGANIZATIONS, ADD_ROLE_TO_ORGANIZATION]);

  const roleTitlesSet :Set<string> = useMemo(() => (
    Set(organization.roles.map((role :Role) => role.title))
  ), [organization]);

  const handleOnChangeRoleTitle = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const newRoleTitle = event.target.value || '';
    setRoleTitle(newRoleTitle);
    setIsValidRoleTitle(!roleTitlesSet.has(newRoleTitle));
  };

  const handleOnChangeRoleDescription = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const newRoleDescription = event.target.value || '';
    setRoleDescription(newRoleDescription);
  };

  const handleOnClose = () => {
    onClose();
    // the timeout avoids rendering the modal with new state before the transition animation finishes
    setTimeout(() => {
      dispatch(resetRequestStates([ADD_ROLE_TO_ORGANIZATION]));
    }, 1000);
  };

  const handleOnClickPrimary = () => {
    if (isNonEmptyString(roleTitle) && !roleTitlesSet.has(roleTitle)) {
      dispatch(
        addRoleToOrganization({
          organizationId,
          roleDescription,
          roleTitle,
        })
      );
    }
    else {
      setIsValidRoleTitle(false);
    }
  };

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBody>
        <Label htmlFor="new-role-title">Title</Label>
        <Input
            disabled={addRoleRS === RequestStates.PENDING}
            id="new-role-title"
            error={!isValidRoleTitle}
            onChange={handleOnChangeRoleTitle} />
        <Label htmlFor="new-role-description">Description</Label>
        <Input
            disabled={addRoleRS === RequestStates.PENDING}
            id="new-role-description"
            onChange={handleOnChangeRoleDescription} />
      </ModalBody>
    ),
    [RequestStates.SUCCESS]: (
      <ModalBody>
        <span>Success!</span>
      </ModalBody>
    ),
    [RequestStates.FAILURE]: (
      <ModalBody>
        <span>Failed to add the role to this organization. Please try again.</span>
      </ModalBody>
    ),
  };

  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnClickPrimary}
        onClose={handleOnClose}
        requestState={addRoleRS}
        requestStateComponents={rsComponents}
        textPrimary="Add"
        textTitle="Add Role" />
  );
};

export default AddRoleToOrgModal;
