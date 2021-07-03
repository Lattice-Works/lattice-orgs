/*
 * @flow
 */

import React, { useState } from 'react';

import { Map } from 'immutable';
import { ReduxUtils, useRequestState, useStepState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import type { Role, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ORGANIZATIONS } from '~/common/constants';
import { getUserProfile } from '~/common/utils';
import { ModalBody, ResetOnUnmount } from '~/components';
import { StepConfirm } from '~/containers/permissions';

import SelectRoles from './SelectRoles';
import StyledFooter from './styled/StyledFooter';

import { ASSIGN_ROLES_TO_MEMBERS, assignRolesToMembers } from '../actions';

const { isPending, isSuccess } = ReduxUtils;

const RESET_ACTIONS = [ASSIGN_ROLES_TO_MEMBERS];

type Props = {
  members :Map;
  onClose :() => void;
  organizationId :UUID;
  roles :Role[];
};

const AssignRolesToMembersModalBody = ({
  members,
  onClose,
  organizationId,
  roles,
} :Props) => {
  const dispatch = useDispatch();
  const [step, stepBack, stepNext] = useStepState(2);
  const requestState :?RequestState = useRequestState([ORGANIZATIONS, ASSIGN_ROLES_TO_MEMBERS]);
  const [selectedRoles, setSelectedRoles] = useState(Map());

  const pending = isPending(requestState);
  const success = isSuccess(requestState);

  const handleSelectRole = (role :Role) => {
    const { id } = role;
    const newSelection = selectedRoles.has(id)
      ? selectedRoles.remove(id)
      : selectedRoles.set(id, role);
    setSelectedRoles(newSelection);
  };

  const handleSave = () => {
    dispatch(assignRolesToMembers({
      organizationId,
      roles: selectedRoles,
      members,
    }));
  };

  const { name, email } = getUserProfile(members.first());
  const membersText = members.size === 1
    ? (name || email)
    : `${members.size} users`;

  const confirmText = `Add ${selectedRoles.size} role(s) to ${membersText}?`;
  const successText = `${selectedRoles.size} roles were added to ${membersText}.`;

  return (
    <>
      {
        step === 0 && (
          <>
            <ModalBody>
              <SelectRoles
                  members={members}
                  onClick={handleSelectRole}
                  roles={roles}
                  selectedRoles={selectedRoles} />
            </ModalBody>
            <StyledFooter
                isDisabledPrimary={!selectedRoles.size}
                onClickPrimary={stepNext}
                shouldStretchButtons
                textPrimary="Continue" />
          </>
        )
      }
      {
        step === 1 && (
          <>
            <ModalBody>
              <ResetOnUnmount actions={RESET_ACTIONS}>
                <StepConfirm
                    confirmText={confirmText}
                    requestState={requestState}
                    successText={successText} />
              </ResetOnUnmount>
            </ModalBody>
            <StyledFooter
                isPendingPrimary={pending}
                onClickPrimary={success ? onClose : handleSave}
                onClickSecondary={stepBack}
                shouldStretchButtons
                textPrimary={success ? 'Close' : 'Save'}
                textSecondary={success ? '' : 'Back'} />
          </>
        )
      }
    </>
  );
};

export default AssignRolesToMembersModalBody;
