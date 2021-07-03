/*
 * @flow
 */

import React, { useEffect } from 'react';

import styled from 'styled-components';
import { OrganizationsApiActions } from 'lattice-sagas';
import { Button, Typography } from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBody } from '~/components';
import { resetRequestStates } from '~/core/redux/actions';

const {
  promoteStagingTable,
  PROMOTE_STAGING_TABLE,
} = OrganizationsApiActions;

const StyledBody = styled(ModalBody)`
  padding-bottom: 30px;
`;

const PromoteBody = ({
  dataSetId,
  dataSetName,
  organizationId,
  requestState,
} :{|
  dataSetId :UUID;
  dataSetName :string;
  organizationId :UUID;
  requestState :?RequestState;
|}) => {

  const dispatch = useDispatch();

  useEffect(() => () => {
    dispatch(resetRequestStates([PROMOTE_STAGING_TABLE]));
  }, [dispatch]);

  const handleSubmit = (e :SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(promoteStagingTable({
      dataSetId,
      organizationId,
      tableName: dataSetName,
    }));
  };

  return (
    <StyledBody>
      <Typography
          color="textSecondary"
          gutterBottom>
        {`Promote the ${dataSetName} data set to the OpenLattice schema.`}
      </Typography>
      <Button
          color="primary"
          fullWidth
          isLoading={requestState === RequestStates.PENDING}
          onClick={handleSubmit}
          type="submit">
        Promote
      </Button>
    </StyledBody>
  );
};

export default PromoteBody;
