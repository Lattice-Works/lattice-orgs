/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { ModalFooter as LUKModalFooter } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Principal, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import StepConfirm from './StepConfirm';
import StepSelectDataSet from './StepSelectDataSet';
import StepSelectPermissions from './StepSelectPermissions';
import StepSelectProperties from './StepSelectProperties';

import { ModalBody, StepsController } from '../../../components';
import { ASSIGN_PERMISSIONS_TO_DATA_SET, assignPermissionsToDataSet } from '../../../core/permissions/actions';
import { resetRequestState } from '../../../core/redux/actions';
import { PERMISSIONS } from '../../../core/redux/constants';
import { SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS, clearSearchState } from '../../../core/search/actions';

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
    dispatch(clearSearchState(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
    dispatch(resetRequestState([ASSIGN_PERMISSIONS_TO_DATA_SET]));
  }, [dispatch]);

  const onConfirm = () => {
    dispatch(
      assignPermissionsToDataSet({
        principal,
        dataSetId: targetDataSetId,
        permissionTypes: targetPermissionOptions.map((option) => option.value),
        withProperties: assignPermissionsToAllProperties,
      })
    );
  };

  const isSuccess = assignPermissionsToDataSetRS === RequestStates.SUCCESS;

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
                        setTargetPermissionOptions={setTargetPermissionOptions}
                        targetDataSetTitle={targetDataSetTitle}
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
                    <StepSelectProperties
                        assignPermissionsToAllProperties={assignPermissionsToAllProperties}
                        setAssignPermissionsToAllProperties={setAssignPermissionsToAllProperties}
                        targetDataSetTitle={targetDataSetTitle}
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
              step === 3 && (
                <>
                  <ModalBody>
                    <StepConfirm
                        assignPermissionsToAllProperties={assignPermissionsToAllProperties}
                        assignPermissionsToDataSetRS={assignPermissionsToDataSetRS}
                        targetDataSetTitle={targetDataSetTitle}
                        targetPermissionOptions={targetPermissionOptions} />
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