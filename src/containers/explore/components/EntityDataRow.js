/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Cell, Colors, StyleUtils } from 'lattice-ui-kit';
import { DataUtils } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import type { UUID } from 'lattice';

import { Routes } from '~/core/router';
import { goToRoute } from '~/core/router/actions';

const { NEUTRAL } = Colors;
const { getEntityKeyId } = DataUtils;

const StyledTableRow = styled.tr`
  background-color: transparent;
  border-bottom: 1px solid ${NEUTRAL.N100};
  ${(props) => !props.isModal && StyleUtils.getHoverStyles};

  &:last-child {
    border-bottom: none;
  }
`;

const EntityDataRow = ({
  data,
  dataSetId,
  headers,
  isModal,
  organizationId,
} :{|
  data :Object;
  dataSetId :UUID;
  headers :Object[];
  isModal :boolean;
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();
  const entityKeyId :UUID = (getEntityKeyId(data) :any);

  const cells = headers.map((header) => (
    <Cell key={`${entityKeyId}_cell_${header.key}`}>{data[header.key]}</Cell>
  ));

  const entityDetailsPath = Routes.ENTITY
    .replace(Routes.ORG_ID_PARAM, organizationId)
    .replace(Routes.DATA_SET_ID_PARAM, dataSetId)
    .replace(Routes.ENTITY_KEY_ID_PARAM, entityKeyId);

  const goToEntityData = () => !isModal && dispatch(goToRoute(
    entityDetailsPath,
    { data },
  ));

  return (
    <StyledTableRow isModal={isModal} onClick={goToEntityData}>
      {cells}
    </StyledTableRow>
  );
};

export default EntityDataRow;
