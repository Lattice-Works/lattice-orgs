// @flow
import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import {
  Button,
  Input,
  Typography,
} from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBody, StackGrid } from '../../../components';
import { resetRequestState } from '../../../core/redux/actions';
import { EDIT_ORGANIZATION_DETAILS, editOrganizationDetails } from '../actions';

const StyledBody = styled(ModalBody)`
  padding-bottom: 30px;
`;

const StyledStack = styled(StackGrid)`
  margin: 16px 0 32px 0;
`;

type Props = {
  organization :Organization;
  requestState :?RequestState;
}

const EditDescriptionBody = ({ organization, requestState } :Props) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(organization.title);
  const [description, setDescription] = useState(organization.description);

  useEffect(() => () => {
    dispatch(resetRequestState([EDIT_ORGANIZATION_DETAILS]));
  }, [dispatch]);

  const handleSubmit = (e :SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(editOrganizationDetails({ title, description, organizationId: organization.id }));
  };

  return (
    <StyledBody>
      <Typography color="textSecondary">Enter the details and description for this organization.</Typography>
      <form onSubmit={handleSubmit}>
        <StyledStack>
          <div>
            <Typography
                color="textSecondary"
                component="label"
                display="block"
                gutterBottom
                htmlFor="org-name"
                variant="subtitle1">
              Name*
            </Typography>
            <Input
                id="org-name"
                onChange={(e :SyntheticEvent<HTMLInputElement>) => setTitle(e.currentTarget.value)}
                required
                value={title} />
          </div>
          <div>
            <Typography
                color="textSecondary"
                component="label"
                display="block"
                gutterBottom
                htmlFor="org-description"
                variant="subtitle1">
              Description
            </Typography>
            <Input
                id="org-description"
                onChange={(e :SyntheticEvent<HTMLInputElement>) => setDescription(e.currentTarget.value)}
                value={description} />
          </div>
        </StyledStack>
        <Button
            color="primary"
            fullWidth
            isLoading={requestState === RequestStates.PENDING}
            type="submit">
          Save
        </Button>
      </form>
    </StyledBody>
  );
};

export default EditDescriptionBody;