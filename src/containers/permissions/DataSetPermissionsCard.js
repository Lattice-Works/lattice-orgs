/*
 * @flow
 */

import React, { useMemo } from 'react';
import type { ComponentType } from 'react';

import _capitalize from 'lodash/capitalize';
import _isFunction from 'lodash/isFunction';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Types } from 'lattice';
import { Colors, Typography } from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type { Ace, PermissionType, UUID } from 'lattice';

import { ORDERED_PERMISSIONS } from '~/common/constants';
import { DataSetTitle, SpaceBetweenGrid, StackGrid } from '~/components';
import { selectOrgDataSet } from '~/core/redux/selectors';
import type { DataSetPermissionTypeSelection } from '~/common/types';

const { NEUTRAL, PURPLE } = Colors;
const { PermissionTypes } = Types;

const DataSetCard :ComponentType<{}> = styled.div`
  align-items: center;
  background-color: ${NEUTRAL.N50};
  border-radius: 5px;
  border: 1px solid ${NEUTRAL.N50};
  padding: 8px 16px;

  &:hover {
    cursor: pointer;
  }
`;

const PermissionTypeCard :ComponentType<{
  isSelected :boolean;
}> = styled.div`
  align-items: center;
  background-color: ${({ isSelected }) => (isSelected ? PURPLE.P00 : 'white')};
  border-radius: 5px;
  border: 1px solid ${({ isSelected }) => (isSelected ? PURPLE.P300 : 'white')};
  margin-left: 24px;
  padding: 8px 16px;

  &:hover {
    cursor: pointer;
  }
`;

const DataSetPermissionsCard = ({
  dataSetId,
  dataSetPermissions,
  isOpen,
  onClick,
  onSelect,
  organizationId,
  selection,
} :{|
  dataSetId :UUID;
  dataSetPermissions :Map<List<UUID>, Ace>;
  isOpen :boolean;
  onClick :(dataSetId :UUID) => void;
  onSelect :(selection :DataSetPermissionTypeSelection) => void;
  organizationId :UUID;
  selection :?DataSetPermissionTypeSelection;
|}) => {

  const dataSet :Map = useSelector(selectOrgDataSet(organizationId, dataSetId));

  const permissionTypeSummaryString = useMemo(() => {
    const dataSetAce :?Ace = dataSetPermissions.get(List([dataSetId]));
    return ORDERED_PERMISSIONS
      .filter((permissionType :PermissionType) => dataSetAce?.permissions.includes(permissionType))
      .map((permissionType :PermissionType) => permissionType.toLowerCase())
      .join(', ');
  }, [dataSetId, dataSetPermissions]);

  const summaryStringsMap :Map<PermissionType, string> = useMemo(() => {
    const dataSetAce :?Ace = dataSetPermissions.get(List([dataSetId]));
    const counts :Map<PermissionType, number> = Map().withMutations((mutableMap) => (
      dataSetPermissions.forEach((ace :Ace) => {
        ace.permissions.forEach((permission :PermissionType) => {
          mutableMap.update(permission, (count :number = 0) => count + 1);
        });
      })
    ));
    return Map().withMutations((mutableMap) => {
      ORDERED_PERMISSIONS.forEach((permissionType :PermissionType) => {
        const count :number = counts.get(permissionType, 0);
        let summaryString = '';
        if (dataSetAce?.permissions.includes(permissionType)) {
          summaryString = (count > 1) ? 'object, columns' : 'object';
        }
        else if (count > 0) {
          summaryString = 'columns';
        }
        mutableMap.set(permissionType, summaryString);
      });
    });
  }, [dataSetId, dataSetPermissions]);

  const handleOnClickDataSetCard = () => {
    if (_isFunction(onClick)) {
      onClick(dataSetId);
    }
  };

  const handleOnClickPermissionTypeCard = (event :SyntheticEvent<HTMLElement>) => {
    const permissionType :?PermissionType = PermissionTypes[event.currentTarget.dataset.permissionType];
    if (permissionType && _isFunction(onSelect)) {
      onSelect({ dataSetId, permissionType });
    }
  };

  return (
    <StackGrid gap={8}>
      <DataSetCard onClick={handleOnClickDataSetCard}>
        <SpaceBetweenGrid>
          <DataSetTitle dataSet={dataSet} />
          <Typography component="span">{permissionTypeSummaryString}</Typography>
        </SpaceBetweenGrid>
      </DataSetCard>
      {
        isOpen && (
          ORDERED_PERMISSIONS.map((permissionType :PermissionType) => (
            <PermissionTypeCard
                data-permission-type={permissionType}
                isSelected={(
                  selection?.dataSetId === dataSetId && selection?.permissionType === permissionType
                )}
                key={permissionType}
                onClick={handleOnClickPermissionTypeCard}>
              <SpaceBetweenGrid>
                <Typography component="span">{_capitalize(permissionType)}</Typography>
                <Typography component="span">{summaryStringsMap.get(permissionType)}</Typography>
              </SpaceBetweenGrid>
            </PermissionTypeCard>
          ))
        )
      }
    </StackGrid>
  );
};

export default DataSetPermissionsCard;
