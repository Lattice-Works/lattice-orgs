/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import {
  Colors,
  Modal,
  ModalHeader,
  Spinner,
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { EXPLORE } from '~/common/constants';
import { ModalBody } from '~/components';

import EntityDataContainer from '../EntityDataContainer';
import { EXPLORE_ENTITY_DATA, EXPLORE_ENTITY_NEIGHBORS } from '../actions';

const { NEUTRAL } = Colors;
const { isPending, reduceRequestStates } = ReduxUtils;

const StyledModalHeader = styled(ModalHeader)`
  background: ${NEUTRAL.N600};
  justify-content: center;
  text-align: center;

  h1,
  svg {
    color: white;
  }

  h1 {
    width: 100%;
  }
`;

const StyledModalBody = styled(ModalBody)`
  height: 90vh;
  width: 70vw;
`;

const EntityDataModal = ({
  dataSetId,
  dataSetName,
  entityKeyId,
  isVisible,
  onClose,
  organizationId
} :{|
  dataSetId :UUID;
  dataSetName :string;
  entityKeyId :UUID;
  isVisible :boolean;
  onClose :() => void;
  organizationId :UUID;
|}) => {
  const exploreEntityDataRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ENTITY_DATA, entityKeyId]);
  const exploreEntityNeighborsRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ENTITY_NEIGHBORS, entityKeyId]);
  const reducedRequestState :?RequestState = reduceRequestStates([exploreEntityDataRS, exploreEntityNeighborsRS]);

  const header = (
    <StyledModalHeader textTitle={`Examining ${dataSetName}: ${dataSetId}`} onClickClose={onClose} />
  );

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        withHeader={header}>
      {
        isPending(reducedRequestState)
          ? (
            <Spinner />
          )
          : (
            <StyledModalBody>
              <EntityDataContainer
                  dataSetId={dataSetId}
                  entityKeyId={entityKeyId}
                  organizationId={organizationId}
                  isModal />
            </StyledModalBody>
          )
      }
    </Modal>
  );
};

export default EntityDataModal;
