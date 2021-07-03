/*
 * @flow
 */

import React, { useEffect } from 'react';

import { OrganizationsApiActions } from 'lattice-sagas';
import { Modal } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { EDM } from '~/common/constants';

import PromoteBody from './PromoteBody';

const { PROMOTE_STAGING_TABLE } = OrganizationsApiActions;

const PromoteTableModal = ({
  dataSetId,
  dataSetName,
  isVisible,
  onClose,
  organizationId,
} :{|
  dataSetId :UUID;
  dataSetName :string;
  isVisible :boolean;
  onClose :() => void;
  organizationId :UUID;
|}) => {

  const requestState :?RequestState = useRequestState([EDM, PROMOTE_STAGING_TABLE]);

  useEffect(() => {
    if (requestState === RequestStates.SUCCESS) {
      onClose();
    }
  }, [onClose, requestState]);

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        textTitle="Promote Data Set"
        viewportScrolling
        withFooter={false}>
      <PromoteBody
          dataSetId={dataSetId}
          dataSetName={dataSetName}
          organizationId={organizationId}
          requestState={requestState} />
    </Modal>
  );
};

export default PromoteTableModal;
