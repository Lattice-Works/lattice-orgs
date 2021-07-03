/*
 * @flow
 */

import React from 'react';

import { AuthUtils } from 'lattice-auth';
import { OrganizationsApiActions } from 'lattice-sagas';
import { ActionModal, Typography } from 'lattice-ui-kit';
import { PersonUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { UserInfo } from 'lattice-auth';
import type { RequestState } from 'redux-reqseq';

import { ORGANIZATIONS } from '~/common/constants';
import { getUserTitle } from '~/common/utils';
import { ModalBody, ResetOnUnmount } from '~/components';

const { getUserId } = PersonUtils;

const { REMOVE_MEMBER_FROM_ORGANIZATION, removeMemberFromOrganization } = OrganizationsApiActions;

const RESET_ACTIONS = [REMOVE_MEMBER_FROM_ORGANIZATION];

type Props = {
  isVisible :boolean;
  member :any;
  onClose :() => void;
  organizationId :UUID;
};

const RemoveMemberFromOrgModal = ({
  isVisible,
  member,
  onClose,
  organizationId,
} :Props) => {

  const dispatch = useDispatch();
  const removeMemberRS :?RequestState = useRequestState([ORGANIZATIONS, REMOVE_MEMBER_FROM_ORGANIZATION]);
  const memberLabel = getUserTitle(member);
  const memberId = getUserId(member);
  const thisUserInfo :?UserInfo = AuthUtils.getUserInfo();
  const thisIsYou = memberId === thisUserInfo?.id;

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBody>
        <Typography>
          {
            thisIsYou
              ? 'Are you sure you want to leave this organization?'
              : `Are you sure you want to remove ${memberLabel} from this organization?`
          }
        </Typography>
      </ModalBody>
    ),
    [RequestStates.SUCCESS]: (
      <ResetOnUnmount actions={RESET_ACTIONS}>
        <Typography>Success!</Typography>
      </ResetOnUnmount>
    ),
    [RequestStates.FAILURE]: (
      <ResetOnUnmount actions={RESET_ACTIONS}>
        <Typography>
          {
            thisIsYou
              ? 'Failed to leave organization. Please try again.'
              : 'Failed to remove member. Please try again.'
          }
        </Typography>
      </ResetOnUnmount>
    ),
  };

  const handleOnClickPrimary = () => {
    dispatch(
      removeMemberFromOrganization({
        memberId,
        organizationId,
      })
    );
  };

  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnClickPrimary}
        onClose={onClose}
        requestState={removeMemberRS}
        requestStateComponents={rsComponents}
        textTitle="Remove Member From Organization" />
  );
};

export default RemoveMemberFromOrgModal;
