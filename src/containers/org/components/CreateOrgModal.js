/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { ActionModal, Input, Label } from 'lattice-ui-kit';
import {
  LangUtils,
  ReduxUtils,
  useGoToRoute,
  useRequestState,
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import * as Routes from '~/core/router/Routes';
import { ORGANIZATIONS } from '~/common/constants';
import { ModalBody, StackGrid } from '~/components';
import { resetRequestStates } from '~/core/redux/actions';
import { selectNewOrgId } from '~/core/redux/selectors';

import { CREATE_NEW_ORGANIZATION, createNewOrganization } from '../actions';

const { isNonEmptyString } = LangUtils;
const { isSuccess } = ReduxUtils;

type Props = {
  onClose :() => void;
};

const CreateOrgModal = ({ onClose } :Props) => {

  const dispatch = useDispatch();

  const [isValidOrgTitle, setIsValidOrgTitle] = useState(true);
  const [orgTitle, setOrgTitle] = useState('');
  const [orgDescription, setOrgDescription] = useState('');

  const createOrganizationRS :?RequestState = useRequestState([ORGANIZATIONS, CREATE_NEW_ORGANIZATION]);

  const handleOnClickPrimary = () => {
    if (isNonEmptyString(orgTitle)) {
      dispatch(
        createNewOrganization({
          description: orgDescription,
          title: orgTitle,
        })
      );
    }
    else {
      setIsValidOrgTitle(false);
    }
  };

  const handleOnChangeOrgTitle = (event :SyntheticInputEvent<HTMLInputElement>) => {
    setOrgTitle(event.target.value || '');
    setIsValidOrgTitle(true);
  };

  const handleOnChangeOrgDescription = (event :SyntheticInputEvent<HTMLInputElement>) => {
    setOrgDescription(event.target.value || '');
  };

  const handleOnClose = () => {
    onClose();
    setTimeout(() => {
      dispatch(resetRequestStates([CREATE_NEW_ORGANIZATION]));
    }, 1000);
  };

  const organizationId :UUID = useSelector(selectNewOrgId());
  const goToOrganization = useGoToRoute(Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId));

  useEffect(() => {
    if (organizationId && isSuccess(createOrganizationRS)) {
      dispatch(resetRequestStates([CREATE_NEW_ORGANIZATION]));
      dispatch(goToOrganization());
    }
  }, [createOrganizationRS, dispatch, goToOrganization, organizationId]);

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBody>
        <StackGrid>
          <span>Enter a title for this organization and an optional description.</span>
          <div>
            <Label htmlFor="new-org-title">Title</Label>
            <Input error={!isValidOrgTitle} onChange={handleOnChangeOrgTitle} />
          </div>
          <div>
            <Label htmlFor="new-org-description">Description</Label>
            <Input onChange={handleOnChangeOrgDescription} />
          </div>
        </StackGrid>
      </ModalBody>
    ),
    [RequestStates.SUCCESS]: (
      <ModalBody>
        <span>Success!</span>
      </ModalBody>
    ),
    [RequestStates.FAILURE]: (
      <ModalBody>
        <span>Failed to create organization. Please try again.</span>
      </ModalBody>
    ),
  };

  return (
    <ActionModal
        isVisible
        onClickPrimary={handleOnClickPrimary}
        onClose={handleOnClose}
        requestState={createOrganizationRS}
        requestStateComponents={rsComponents}
        textPrimary="Create"
        textTitle="New Organization" />
  );
};

export default CreateOrgModal;
