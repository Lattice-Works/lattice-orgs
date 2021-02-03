/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { ActionModal } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBody } from '../../../components';
import { resetRequestState } from '../../../core/redux/actions';
import { ORGANIZATIONS } from '../../../core/redux/constants';
import { DELETE_EXISTING_ORGANIZATION, deleteExistingOrganization } from '../actions';

const { isSuccess } = ReduxUtils;

type Props = {
  isOwner :boolean;
  isVisible :boolean;
  onClose :() => void;
  organization :Organization;
};

const DeleteOrgModal = ({
  isOwner,
  isVisible,
  onClose,
  organization,
} :Props) => {

  const [standbyMessage, updateStandbyMessage] = useState(
    'Are you sure you want to delete this organization? This action cannot be undone.'
  );

  const dispatch = useDispatch();

  const deleteOrgRS :?RequestState = useRequestState([ORGANIZATIONS, DELETE_EXISTING_ORGANIZATION]);

  const handleOnClickPrimary = () => {
    if (isOwner) {
      dispatch(deleteExistingOrganization(organization));
    }
    else {
      updateStandbyMessage('You must be an owner to delete an organization.');
    }
  };

  const handleOnClose = () => {
    onClose();
    setTimeout(() => {
      dispatch(resetRequestState([DELETE_EXISTING_ORGANIZATION]));
    }, 1000);
  };

  useEffect(() => {
    if (isSuccess(deleteOrgRS)) handleOnClose();
  });

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBody>
        <span>{standbyMessage}</span>
      </ModalBody>
    ),
    [RequestStates.SUCCESS]: (
      <ModalBody>
        <span>Success!</span>
      </ModalBody>
    ),
    [RequestStates.FAILURE]: (
      <ModalBody>
        <span>Failed to delete organization. Please try again.</span>
      </ModalBody>
    ),
  };

  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnClickPrimary}
        onClose={handleOnClose}
        requestState={deleteOrgRS}
        requestStateComponents={rsComponents}
        shouldStretchButtons
        textPrimary="Delete"
        textTitle="Delete Organization" />
  );
};

export default DeleteOrgModal;
