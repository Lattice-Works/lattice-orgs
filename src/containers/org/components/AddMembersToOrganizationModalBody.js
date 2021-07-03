/*
 * @flow
 */

import React, { useCallback, useState } from 'react';

import { Map } from 'immutable';
import {
  List as LUKList,
  Typography,
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState, useStepState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import type { List } from 'immutable';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ORGANIZATIONS } from '~/common/constants';
import { getUserProfile } from '~/common/utils';
import { ModalBody, ResetOnUnmount } from '~/components';
import { StepConfirm } from '~/containers/permissions';
import type { ReactSelectOption } from '~/common/types';

import AddMemberListItem from './AddMemberListItem';
import SearchMemberBar from './SearchMemberBar';
import StyledFooter from './styled/StyledFooter';

import { ADD_MEMBERS_TO_ORGANIZATION, addMembersToOrganization } from '../actions';

const { isPending, isSuccess } = ReduxUtils;

type Props = {
  members :List;
  onClose :() => void;
  organizationId :UUID;
};

const RESET_ACTIONS = [ADD_MEMBERS_TO_ORGANIZATION];

const AddMembersToOrganzationModalBody = ({ members, onClose, organizationId } :Props) => {
  const dispatch = useDispatch();
  const [step, stepBack, stepNext] = useStepState(2);
  const [selectedMembers, setMembers] = useState(Map());
  const requestState :?RequestState = useRequestState([ORGANIZATIONS, ADD_MEMBERS_TO_ORGANIZATION]);

  const pending = isPending(requestState);
  const success = isSuccess(requestState);

  const handleChange = useCallback((option ?:ReactSelectOption<Map>) => {
    const { id } = getUserProfile(option?.value);
    if (id) {
      const newMembers = selectedMembers.set(id, option?.value);
      setMembers(newMembers);
    }
  }, [selectedMembers]);

  const handleRemoveMember = (id :string) => {
    const newMembers = selectedMembers.remove(id);
    setMembers(newMembers);
  };

  const handleOnClickPrimary = () => {
    dispatch(
      addMembersToOrganization({
        organizationId,
        members: selectedMembers
      })
    );
  };

  const confirmText = `Add ${selectedMembers.size} member(s) to this organization?`;
  const successText = `${selectedMembers.size} member(s) were added to this organization.`;

  return (
    <>
      {
        step === 0 && (
          <>
            <ModalBody>
              <Typography>Search and select the people you wish to add to the organization</Typography>
              <SearchMemberBar existingMembers={members} onChange={handleChange} />
              <LUKList>
                {
                  selectedMembers.valueSeq().map((member, index) => {
                    const { id } = getUserProfile(member);
                    return (
                      <AddMemberListItem
                          disableGutters
                          divider={index !== selectedMembers.size - 1}
                          key={`member-${id}`}
                          member={member}
                          onClick={handleRemoveMember} />
                    );
                  })
                }
              </LUKList>
            </ModalBody>
            <StyledFooter
                isPendingPrimary={pending}
                isPrimaryDisabled={!selectedMembers.size}
                onClickPrimary={stepNext}
                shouldStretchButtons
                textPrimary="Add" />

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
                onClickPrimary={success ? onClose : handleOnClickPrimary}
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

export default AddMembersToOrganzationModalBody;
