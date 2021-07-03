/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Spinner, Typography } from 'lattice-ui-kit';

const MarginSpinner = styled(Spinner)`
  margin-left: 8px;
`;

type Props = {
  isAssembled :boolean;
  isLoading :boolean;
};

const AssembleMenuItemContent = ({ isAssembled, isLoading } :Props) => {

  const label = isAssembled ? 'Disassemble' : 'Assemble';
  return (
    <Typography>
      { label }
      {
        isLoading && <MarginSpinner />
      }
    </Typography>
  );
};

export default AssembleMenuItemContent;
