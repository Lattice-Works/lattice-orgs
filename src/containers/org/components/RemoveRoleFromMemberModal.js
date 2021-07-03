/*
 * @flow
 */

import React from 'react';

import { OrganizationsApiActions } from 'lattice-sagas';
import { ActionModal, Typography } from 'lattice-ui-kit';
import { PersonUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Role, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ORGANIZATIONS } from '~/common/constants';
import { getUserTitle } from '~/common/utils';
import { ModalBody, ResetOnUnmount } from '~/components';

const { getUserId } = PersonUtils;

const { REMOVE_ROLE_FROM_MEMBER, removeRoleFromMember } = OrganizationsApiActions;

const RESET_ACTIONS = [REMOVE_ROLE_FROM_MEMBER];

type Props = {
  isVisible :boolean;
  member :any;
  onClose :() => void;
  organizationId :UUID;
  role :?Role;
};

const RemoveRoleFromMemberModal = ({
  isVisible,
  member,
  onClose,
  organizationId,
  role,
} :Props) => {

  const dispatch = useDispatch();
  const removeRoleRS :?RequestState = useRequestState([ORGANIZATIONS, REMOVE_ROLE_FROM_MEMBER]);
  const memberLabel = getUserTitle(member);
  const memberId = getUserId(member);
  const roleId :UUID = role?.id || '';
  const roleTitle :string = role?.title || '';

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBody>
        <span>{`Are you sure you want to delete the ${roleTitle} role from ${memberLabel}?`}</span>
      </ModalBody>
    ),
    [RequestStates.SUCCESS]: (
      <ResetOnUnmount actions={RESET_ACTIONS}>
        <Typography>Success!</Typography>
      </ResetOnUnmount>
    ),
    [RequestStates.FAILURE]: (
      <ResetOnUnmount actions={RESET_ACTIONS}>
        <Typography>Failed to delete role. Please try again.</Typography>
      </ResetOnUnmount>
    ),
  };

  const handleOnClickPrimary = () => {
    dispatch(
      removeRoleFromMember({
        memberId,
        organizationId,
        roleId,
      })
    );
  };

  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnClickPrimary}
        onClose={onClose}
        requestState={removeRoleRS}
        requestStateComponents={rsComponents}
        shouldStretchButtons
        textPrimary="Delete"
        textTitle="Delete Role" />
  );
};

export default RemoveRoleFromMemberModal;
