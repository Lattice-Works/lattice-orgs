/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import _capitalize from 'lodash/capitalize';
import styled from 'styled-components';
import { ModalFooter as LUKModalFooter } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Principal, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { PERMISSIONS } from '~/common/constants';
import { ModalBody, StepsController } from '~/components';
import { ASSIGN_PERMISSIONS_TO_DATA_SET, assignPermissionsToDataSet } from '~/core/permissions/actions';
import { resetRequestStates } from '~/core/redux/actions';
import { SEARCH_ORGANIZATION_DATA_SETS, clearSearchState } from '~/core/search/actions';

import StepSelectDataSet from './StepSelectDataSet';

import StepConfirm from '../StepConfirm';
import StepSelectPermissions from '../StepSelectPermissions';

const ModalFooter = styled(LUKModalFooter)`
  padding: 30px 0;
`;

const AssignPermissionsToDataSetModalBody = ({
  onClose,
  organizationId,
  principal,
} :{
  onClose :() => void;
  organizationId :UUID;
  principal :Principal;
}) => {

  const dispatch = useDispatch();

  const [assignPermissionsToAllProperties, setAssignPermissionsToAllProperties] = useState(true);
  const [targetDataSetId, setTargetDataSetId] = useState('');
  const [targetDataSetTitle, setTargetDataSetTitle] = useState('');
  const [targetPermissionOptions, setTargetPermissionOptions] = useState([]);

  const assignPermissionsToDataSetRS :?RequestState = useRequestState([PERMISSIONS, ASSIGN_PERMISSIONS_TO_DATA_SET]);

  useEffect(() => () => {
    dispatch(clearSearchState(SEARCH_ORGANIZATION_DATA_SETS));
    dispatch(resetRequestStates([ASSIGN_PERMISSIONS_TO_DATA_SET]));
  }, [dispatch]);

  const onConfirm = () => {
    dispatch(
      assignPermissionsToDataSet({
        dataSetId: targetDataSetId,
        organizationId,
        permissionTypes: targetPermissionOptions.map((option) => option.value),
        principal,
        withColumns: assignPermissionsToAllProperties,
      })
    );
  };

  const isSuccess = assignPermissionsToDataSetRS === RequestStates.SUCCESS;

  const permissions = targetPermissionOptions
    .map((option) => option.value)
    .map(_capitalize)
    .join(', ');

  const confirmText = assignPermissionsToAllProperties
    ? `Please confirm you want to assign ${permissions} to "${targetDataSetTitle}" and all its columns.`
    : `Please confirm you want to assign ${permissions} to "${targetDataSetTitle}".`;

  return (
    <StepsController>
      {
        ({ step, stepBack, stepNext }) => (
          <>
            {
              step === 0 && (
                <>
                  <ModalBody>
                    <StepSelectDataSet
                        organizationId={organizationId}
                        setTargetDataSetId={setTargetDataSetId}
                        setTargetDataSetTitle={setTargetDataSetTitle}
                        targetDataSetId={targetDataSetId} />
                  </ModalBody>
                  <ModalFooter
                      onClickPrimary={stepNext}
                      onClickSecondary={stepBack}
                      shouldStretchButtons
                      textPrimary="Continue"
                      textSecondary="" />
                </>
              )
            }
            {
              step === 1 && (
                <>
                  <ModalBody>
                    <StepSelectPermissions
                        assignPermissionsToAllProperties={assignPermissionsToAllProperties}
                        isDataSet={!!targetDataSetId}
                        setAssignPermissionsToAllProperties={setAssignPermissionsToAllProperties}
                        setTargetPermissionOptions={setTargetPermissionOptions}
                        targetTitle={targetDataSetTitle}
                        targetPermissionOptions={targetPermissionOptions} />
                  </ModalBody>
                  <ModalFooter
                      onClickPrimary={stepNext}
                      onClickSecondary={stepBack}
                      shouldStretchButtons
                      textPrimary="Continue"
                      textSecondary="Back" />
                </>
              )
            }
            {
              step === 2 && (
                <>
                  <ModalBody>
                    <StepConfirm
                        confirmText={confirmText}
                        requestState={assignPermissionsToDataSetRS} />
                  </ModalBody>
                  <ModalFooter
                      isPendingPrimary={assignPermissionsToDataSetRS === RequestStates.PENDING}
                      onClickPrimary={isSuccess ? onClose : onConfirm}
                      onClickSecondary={stepBack}
                      shouldStretchButtons
                      textPrimary={isSuccess ? 'Close' : 'Confirm'}
                      textSecondary={isSuccess ? '' : 'Back'} />
                </>
              )
            }
          </>
        )
      }
    </StepsController>
  );
};

export default AssignPermissionsToDataSetModalBody;
