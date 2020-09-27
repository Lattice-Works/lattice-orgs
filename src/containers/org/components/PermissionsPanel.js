/*
 * @flow
 */

import React, { useMemo } from 'react';

import styled from 'styled-components';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import {
  Card,
  Checkbox,
  Colors,
  IconButton,
  Sizes,
  StyleUtils,
  Typography,
} from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type {
  Ace,
  PermissionType,
  Principal,
  PropertyType,
  UUID,
} from 'lattice';

import { SpaceBetweenCardSegment } from '../../../components';
import { selectEntitySetPropertyTypes, selectPermissions } from '../../../core/redux/utils';

const { NEUTRAL } = Colors;
const { APP_CONTENT_PADDING } = Sizes;
const { media } = StyleUtils;

const Panel = styled.div`
  background-color: white;
  border-left: 1px solid ${NEUTRAL.N100};
  height: 100%;
  padding: ${APP_CONTENT_PADDING}px;

  ${media.phone`
    padding: ${APP_CONTENT_PADDING / 2}px;
  `}
`;

const PanelHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const PermissionsCard = styled(Card)`
  border: none;
`;

const PermissionsPanel = ({
  dataSetId,
  onClose,
  permissionType,
  principal,
} :{|
  dataSetId :UUID;
  onClose :() => void;
  principal :Principal;
  permissionType :PermissionType;
|}) => {

  const propertyTypes :Map<UUID, PropertyType> = useSelector(selectEntitySetPropertyTypes(dataSetId));

  const keys :List<List<UUID>> = useMemo(() => (
    List().withMutations((mutableList) => {
      propertyTypes.keySeq().forEach((propertyTypeId :UUID) => {
        mutableList.push(List([dataSetId, propertyTypeId]));
      });
    })
  ), [dataSetId, propertyTypes.hashCode()]);

  const propertyTypePermissions :Map<List<UUID>, Ace> = useSelector(selectPermissions(keys, principal));

  return (
    <Panel>
      <PanelHeader>
        <Typography variant="h1">{permissionType}</Typography>
        <IconButton onClick={onClose}>
          <FontAwesomeIcon color={NEUTRAL.N800} fixedWidth icon={faTimes} size="lg" />
        </IconButton>
      </PanelHeader>
      <PermissionsCard>
        {
          propertyTypePermissions.map((ace :Ace, key :List<UUID>) => {
            const propertyTypeId :UUID = key.get(1);
            const propertyType :PropertyType = propertyTypes.get(propertyTypeId);
            const isPermissionAssigned = ace.permissions.includes(permissionType);
            return (
              <SpaceBetweenCardSegment key={propertyTypeId} padding="8px 0">
                <Typography component="span" variant="body1">{propertyType.title}</Typography>
                <Checkbox checked={isPermissionAssigned} onChange={() => {}} />
              </SpaceBetweenCardSegment>
            );
          }).valueSeq()
        }
      </PermissionsCard>
    </Panel>
  );
};

export default PermissionsPanel;
