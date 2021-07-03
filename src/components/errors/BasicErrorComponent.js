/*
 * @flow
 */

import React from 'react';
import type { Node } from 'react';

import styled from 'styled-components';
import { Typography } from 'lattice-ui-kit';

import type { SagaError } from '~/common/types';

const Error = styled.div`
  align-items: center;
  display: flex;
  flex: 0;
  flex-direction: column;
  justify-content: center;
  padding: 30px;
  text-align: center;

  > span {
    margin: 10px 0;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

type Props = {
  children ?:Node;
  error :?SagaError;
  // message :?string;
};

const BasicErrorComponent = ({ children, error } :Props) => {

  let errorMessage = children;
  if (error && (error.status === 401 || error.status === 403)) {
    errorMessage = (
      <Typography component="span">Sorry, you are not authorized to view this page.</Typography>
    );
  }

  if (!errorMessage) {
    errorMessage = (
      <Typography component="span">Sorry, something went wrong. Please try again.</Typography>
    );
  }

  return (
    <Error>
      {errorMessage}
    </Error>
  );
};

BasicErrorComponent.defaultProps = {
  children: undefined,
  error: undefined,
  // message: undefined,
};

export default BasicErrorComponent;
