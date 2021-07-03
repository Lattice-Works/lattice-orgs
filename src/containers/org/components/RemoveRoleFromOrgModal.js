/*
 * @flow
 */

import React from 'react';

import { Modal, Typography } from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import type { UUID } from 'lattice';

import { ResetOnUnmount } from '~/components';

import { REMOVE_ROLE_FROM_ORGANIZATION, removeRoleFromOrganization } from '../actions';

const RESET_ACTIONS = [REMOVE_ROLE_FROM_ORGANIZATION];

type Props = {
  isVisible :boolean;
  onClose :() => void;
  organizationId :UUID;
  roleId :UUID;
};

const RemoveRoleFromOrgModal = ({
  isVisible,
  onClose,
  organizationId,
  roleId
} :Props) => {
  const dispatch = useDispatch();

  const handleOnClickPrimary = () => {
    dispatch(
      removeRoleFromOrganization({
        organizationId,
        roleId,
      })
    );
  };

  return (
    <Modal
        isVisible={isVisible}
        textPrimary="Delete"
        onClickPrimary={handleOnClickPrimary}
        onClose={onClose}
        textTitle="Delete Role">
      <ResetOnUnmount actions={RESET_ACTIONS}>
        <Typography>Are you sure you want to delete this role? This action cannot be undone.</Typography>
      </ResetOnUnmount>
    </Modal>
  );
};

export default RemoveRoleFromOrgModal;
