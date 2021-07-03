/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import {
  Input,
  Modal,
  ModalFooter,
  Typography
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ORGANIZATIONS } from '~/common/constants';
import { ModalBody, ResetOnUnmount } from '~/components';
import { resetRequestStates } from '~/core/redux/actions';

import { DELETE_EXISTING_ORGANIZATION, deleteExistingOrganization } from '../actions';

const {
  isFailure,
  isPending,
  isStandby,
  isSuccess
} = ReduxUtils;

const RESET_ACTIONS = [DELETE_EXISTING_ORGANIZATION];

const CONFIRM_DELETE_TEXT = 'Yes, Delete';

type Props = {
  isOwner :boolean;
  isVisible :boolean;
  onClose :() => void;
  organizationId :UUID;
  organizationName :string;
};

const DeleteOrgModal = ({
  isOwner,
  isVisible,
  onClose,
  organizationId,
  organizationName
} :Props) => {

  const [orgNameMatch, setOrgNameMatch] = useState('');
  const [confirmText, setConfirmText] = useState(CONFIRM_DELETE_TEXT);

  const dispatch = useDispatch();

  const deleteOrgRS :?RequestState = useRequestState([ORGANIZATIONS, DELETE_EXISTING_ORGANIZATION]);

  const deleteIsStandby :boolean = isStandby(deleteOrgRS);
  const deleteIsPending :boolean = isPending(deleteOrgRS);
  const deleteIsFailure :boolean = isFailure(deleteOrgRS);
  const deleteIsSuccess :boolean = isSuccess(deleteOrgRS);

  const handleInputChange = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const orgName = event.target.value || '';
    setOrgNameMatch(orgName);
  };

  const handleOnClickPrimary = () => {
    if (isOwner) {
      dispatch(deleteExistingOrganization(organizationId));
    }
  };

  const resetRequestState = () => {
    dispatch(resetRequestStates(RESET_ACTIONS));
    setConfirmText(CONFIRM_DELETE_TEXT);
  };

  useEffect(() => {
    if (deleteIsSuccess) onClose();
    if (deleteIsFailure) {
      setConfirmText('Try Again');
      setOrgNameMatch('');
    }
  }, [deleteIsSuccess, deleteIsFailure, onClose, setConfirmText, setOrgNameMatch]);

  let body = (
    <ModalBody>
      <Typography paragraph>
        Are you sure you want to delete this organization? This action cannot be undone.
      </Typography>
      <Typography>To confirm, please type the organization name.</Typography>
      <Input
          disabled={deleteIsPending}
          id="org-name-confirmation"
          error={orgNameMatch.length && orgNameMatch !== organizationName}
          onChange={handleInputChange} />
    </ModalBody>
  );

  if (deleteIsFailure) {
    body = (
      <ModalBody>
        <Typography>Failed to delete organization. Please try again.</Typography>
      </ModalBody>
    );
  }

  // TODO: figure out why this is throwing that "unique key prop" error if the "key" prop is not set
  const withFooter = (
    <ModalFooter
        isDisabledPrimary={deleteIsStandby && orgNameMatch !== organizationName}
        isPendingPrimary={deleteIsPending}
        isPendingSecondary={deleteIsPending}
        key="modal-footer"
        onClickPrimary={deleteIsStandby ? handleOnClickPrimary : resetRequestState}
        onClickSecondary={deleteIsStandby && onClose}
        shouldStretchButtons
        textPrimary={confirmText}
        textSecondary={deleteIsStandby && 'No, Cancel'} />
  );

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        textTitle="Delete Organization"
        withFooter={withFooter}>
      <ResetOnUnmount actions={RESET_ACTIONS}>
        { body }
      </ResetOnUnmount>
    </Modal>
  );
};

export default DeleteOrgModal;
