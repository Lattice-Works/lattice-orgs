/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { faSortDown } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import {
  Colors,
  IconButton,
  Label,
  Typography,
} from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type { UUID } from 'lattice';

import { METADATA, NAME, TITLE } from '~/common/constants';
import { Flip } from '~/components';
import { selectOrgDataSetColumns } from '~/core/redux/selectors';

const { NEUTRAL, PURPLE } = Colors;

const downIcon = <FontAwesomeIcon icon={faSortDown} size="xs" />;

const DataGrid = styled.div`
  display: grid;
  flex: 1;
  font-size: 14px;
  grid-gap: 20px 30px;
  grid-template-columns: repeat(auto-fill, minmax(200px, auto));

  > div {
    max-width: 500px;
    word-break: break-word;
  }
`;

const CountText = styled.div`
  color: ${PURPLE.P300};
  font-weight: 600;
  margin: 0 5px;
`;

const InfoText = styled.div`
  align-items: center;
  color: ${NEUTRAL.N400};
  display: flex;
  margin: 15px 0;

  button {
    margin-left: 5px;
  }
`;

const ValueList = styled.ul`
  list-style: ${({ size }) => (size > 1 ? 'disc' : 'none')} inside;
  margin: 0;
  padding-left: 2px;
`;

const ValueListItem = styled.li`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const EntityDataGrid = ({
  data,
  dataSetId,
  organizationId,
} :{|
  data :Map;
  dataSetId :UUID;
  organizationId :UUID;
|}) => {

  const [showFull, setShowFull] = useState(false);

  const dataSetColumns :Map<UUID, Map> = useSelector(selectOrgDataSetColumns(organizationId, dataSetId));

  const expandFields = () => {
    setShowFull(!showFull);
  };

  const items = [];
  const labels = {};
  dataSetColumns.forEach((column :Map) => {
    const fqn = column.get(NAME);
    const title = column.getIn([METADATA, TITLE]);
    const values :List = data.get(fqn, List());

    labels[fqn] = title;

    const elements = [];
    if (!values.isEmpty()) {
      values.forEach((value, index) => {
        elements.push(
          <ValueListItem key={index.toString()}>{value}</ValueListItem>
        );
      });
    }

    if (elements.length) {
      items.push(
        <div key={fqn}>
          <Label subtle>{title}</Label>
          <ValueList size={elements.length}>{elements}</ValueList>
        </div>
      );
    }
  });

  const visibleItems = items.slice(0, 8);
  const hiddenItems = items.slice(8);

  return (
    <>
      <DataGrid>
        { visibleItems }
        { showFull && hiddenItems }
      </DataGrid>
      {
        !!items.slice(8).length && (
          <InfoText>
            <Typography variant="subtitle1">See</Typography>
            <CountText variant="button">{` ${hiddenItems.length} `}</CountText>
            <Typography variant="subtitle1">more properties used in this dataset</Typography>
            <Flip flip={showFull}>
              <IconButton aria-label="toggle show all fields" onClick={expandFields}>
                { downIcon }
              </IconButton>
            </Flip>
          </InfoText>
        )
      }
    </>
  );
};

export default EntityDataGrid;
