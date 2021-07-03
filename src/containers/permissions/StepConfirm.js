/*
 * @flow
 */

import React from 'react';
import type { Node } from 'react';

import { Typography } from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import type { RequestState } from 'redux-reqseq';

import { BasicErrorComponent, StackGrid } from '~/components';

const {
  isFailure,
  isPending,
  isStandby,
  isSuccess,
} = ReduxUtils;

const StepConfirm = ({
  confirmText,
  requestState,
  successText,
} :{
  confirmText :Node;
  requestState :?RequestState;
  successText :Node;
}) => (
  <StackGrid>
    {
      (isStandby(requestState) || isPending(requestState)) && (
        <Typography>
          {confirmText}
        </Typography>
      )
    }
    {
      isSuccess(requestState) && (
        <Typography>{successText}</Typography>
      )
    }
    {
      isFailure(requestState) && (
        <BasicErrorComponent />
      )
    }
  </StackGrid>
);

StepConfirm.defaultProps = {
  successText: 'Success!'
};

export default StepConfirm;
