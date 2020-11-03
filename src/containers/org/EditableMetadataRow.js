// @flow
import React from 'react';

import styled from 'styled-components';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Colors, IconButton } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

const StyledRow = styled.tr`
  &:nth-child(odd) {
    background: ${NEUTRAL.N50}
  }
`;

type Props = {
  components :Object;
  data :Object;
  headers :Array<Object>;
  onClick :() => void;
}
const EditableMetadataRow = ({
  components,
  data,
  headers,
  onClick,
} :Props) => {

  const { id } = data;

  const cells = headers
    .map((header) => {
      if (header.key === 'action') {
        return (
          <components.Cell key={`${id}_cell_${header.key}`}>
            <IconButton onClick={onClick}>
              <FontAwesomeIcon icon={faPen} />
            </IconButton>
          </components.Cell>
        );
      }
      return <components.Cell key={`${id}_cell_${header.key}`}>{data[header.key]}</components.Cell>;
    });

  return (
    <StyledRow>
      {cells}
    </StyledRow>
  );
};

export default EditableMetadataRow;
