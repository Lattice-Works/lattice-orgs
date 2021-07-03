/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import _capitalize from 'lodash/capitalize';
import _isBoolean from 'lodash/isBoolean';
import styled from 'styled-components';
import { faTimes, faUndo } from '@fortawesome/pro-light-svg-icons';
import { faToggleOn } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map, Set } from 'immutable';
import { Models } from 'lattice';
import {
  Button,
  CardSegment,
  Colors,
  IconButton,
  Sizes,
  StyleUtils,
  Typography,
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type {
  Ace,
  PermissionType,
  Principal,
  PropertyType,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  ID,
  METADATA,
  NAME,
  PERMISSIONS,
  TITLE,
} from '~/common/constants';
import { getDataSetKeys } from '~/common/utils';
import { Divider, SpaceBetweenGrid } from '~/components';
import { SET_PERMISSIONS, setPermissions } from '~/core/permissions/actions';
import { computePermissionAssignments } from '~/core/permissions/utils';
import {
  selectMyKeys,
  selectOrgDataSet,
  selectOrgDataSetColumns,
  selectPrincipalPermissions,
  selectPropertyTypes,
} from '~/core/redux/selectors';

import { ObjectPermissionCheckbox } from './components';

const { NEUTRAL, PURPLE } = Colors;
const { APP_CONTENT_PADDING } = Sizes;
const { media } = StyleUtils;
const { AceBuilder, FQN } = Models;
const { isPending, isSuccess } = ReduxUtils;

const Panel = styled.div`
  background-color: white;
  border-left: 1px solid ${NEUTRAL.N100};
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 384px;
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

const ButtonsWrapper = styled.div`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: 1fr auto;
`;

const PermissionsPanel = ({
  dataSetId,
  onClose,
  organizationId,
  permissionType,
  principal,
} :{|
  dataSetId :UUID;
  onClose :() => void;
  organizationId :UUID;
  permissionType :PermissionType;
  principal :Principal;
|}) => {

  const dispatch = useDispatch();
  const [isPermissionAssignedToAll, setIsPermissionAssignedToAll] = useState(false);
  const [isPermissionAssignedToOnlyNonPII, setIsPermissionAssignedToOnlyNonPII] = useState(false);
  const [localPermissions, setLocalPermissions] = useState(Map());

  const setPermissionsRS :?RequestState = useRequestState([PERMISSIONS, SET_PERMISSIONS]);

  const dataSet :Map = useSelector(selectOrgDataSet(organizationId, dataSetId));
  const dataSetColumns :Map<UUID, Map> = useSelector(selectOrgDataSetColumns(organizationId, dataSetId));
  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());

  const dataSetKey :List<UUID> = useMemo(() => List([dataSetId]), [dataSetId]);
  const keys :List<List<UUID>> = useMemo(() => getDataSetKeys(dataSet, dataSetColumns), [dataSet, dataSetColumns]);
  const permissions :Map<List<UUID>, Ace> = useSelector(selectPrincipalPermissions(keys, principal));
  const permissionsHash :number = permissions.hashCode();

  useEffect(() => {
    setLocalPermissions(permissions);
  }, [permissionsHash]);

  useEffect(() => {
    if (isSuccess(setPermissionsRS) && permissions.isEmpty()) {
      onClose();
    }
  }, [permissionsHash, setPermissionsRS]);

  const columnIds :List<UUID> = useMemo(() => (
    dataSetColumns.map((column :Map) => column.get(ID))
  ), [dataSetColumns]);
  const maybePropertyTypes :Map<UUID, PropertyType> = useSelector(selectPropertyTypes(columnIds));
  const propertyTypesHash :number = maybePropertyTypes.hashCode();

  useEffect(() => {
    const { isAssignedToAll, isAssignedToOnlyNonPII } = computePermissionAssignments(
      myKeys,
      dataSetColumns,
      dataSetId,
      localPermissions,
      permissionType,
      maybePropertyTypes,
    );
    setIsPermissionAssignedToAll(isAssignedToAll);
    setIsPermissionAssignedToOnlyNonPII(isAssignedToOnlyNonPII);
  }, [
    dataSetColumns,
    dataSetId,
    localPermissions,
    myKeys,
    permissionType,
    propertyTypesHash,
  ]);

  // TODO: update Ace model to use Set for immutable equality to be able to use .equals()
  // const equalPermissions :boolean = permissions.equals(localPermissions);
  const arePermissionsEqual = localPermissions.reduce((equal :boolean, localAce :Ace, key :List<UUID>) => {
    const originalAce :?Ace = permissions.get(key);
    if (!originalAce) {
      // NOTE: it's possible the property does not have permissions originally, which means an ace will not exist. in
      // this case, a non-existent ace is equivalent to a local ace with an empty permissions array.
      return equal && localAce.permissions.length === 0;
    }
    return (
      equal
      && localAce.principal.valueOf() === originalAce.principal.valueOf()
      && Set(localAce.permissions).equals(Set(originalAce.permissions))
    );
  }, true);

  const handleOnChangePermission = (targetKey :List<UUID>, _ :PermissionType, isChecked :boolean) => {
    // add permission
    if (isChecked) {
      const updatedPermissions :Map<List<UUID>, Ace> = localPermissions.update(targetKey, (ace :Ace) => {
        const updatedAcePermissions = Set(ace?.permissions).add(permissionType);
        return (new AceBuilder()).setPermissions(updatedAcePermissions).setPrincipal(principal).build();
      });
      setLocalPermissions(updatedPermissions);
    }
    // remove permission
    else {
      const updatedPermissions :Map<List<UUID>, Ace> = localPermissions.update(targetKey, (ace :Ace) => {
        const updatedAcePermissions = Set(ace?.permissions).delete(permissionType);
        return (new AceBuilder()).setPermissions(updatedAcePermissions).setPrincipal(principal).build();
      });
      setLocalPermissions(updatedPermissions);
    }
  };

  const handleOnClickSave = () => {
    const updatedPermissions :Map<List<UUID>, Ace> = localPermissions
      .filter((localAce :Ace, key :List<UUID>) => {
        let equal = true;
        const originalAce :?Ace = permissions.get(key);
        if (!originalAce) {
          // NOTE: it's possible the property does not have permissions originally, which means an ace will not exist.
          // in this case, a non-existent ace is equivalent to a local ace with an empty permissions array.
          equal = localAce.permissions.length === 0;
        }
        else {
          equal = (
            localAce.principal.valueOf() === originalAce.principal.valueOf()
            && Set(localAce.permissions).equals(Set(originalAce.permissions))
          );
        }
        // NOTE: we only want to consider permissions that have changed, i.e. not equal
        return !equal;
      });
    dispatch(setPermissions(updatedPermissions));
  };

  const resetPermissions = () => {
    setLocalPermissions(permissions);
  };

  const togglePermissionAssignmentAll = () => {
    if (isPermissionAssignedToAll) {
      // remove permission from all columns
      const updatedPermissions :Map<List<UUID>, Ace> = Map().withMutations((mutableMap) => {
        mutableMap.set(dataSetKey, localPermissions.get(dataSetKey));
        dataSetColumns.forEach((column :Map) => {
          const columnId :UUID = column.get(ID);
          const key = List([dataSetId, columnId]);
          const isOwner = myKeys.has(key);
          if (isOwner) {
            const localAce :?Ace = localPermissions.get(key);
            const updatedAcePermissions = Set(localAce?.permissions).delete(permissionType);
            const updatedAce = (new AceBuilder())
              .setPermissions(updatedAcePermissions)
              .setPrincipal(principal)
              .build();
            mutableMap.set(key, updatedAce);
          }
        });
      });
      setLocalPermissions(updatedPermissions);
    }
    else {
      // add permission to all columns
      const updatedPermissions :Map<List<UUID>, Ace> = Map().withMutations((mutableMap) => {
        mutableMap.set(dataSetKey, localPermissions.get(dataSetKey));
        dataSetColumns.forEach((column :Map) => {
          const columnId :UUID = column.get(ID);
          const key = List([dataSetId, columnId]);
          const isOwner = myKeys.has(key);
          if (isOwner) {
            const localAce :?Ace = localPermissions.get(key);
            const updatedAcePermissions = Set(localAce?.permissions).add(permissionType);
            const updatedAce = (new AceBuilder())
              .setPermissions(updatedAcePermissions)
              .setPrincipal(principal)
              .build();
            mutableMap.set(key, updatedAce);
          }
        });
      });
      setLocalPermissions(updatedPermissions);
    }
  };

  const togglePermissionAssignmentOnlyNonPII = () => {
    if (isPermissionAssignedToOnlyNonPII) {
      resetPermissions();
    }
    else {
      const updatedPermissions :Map<List<UUID>, Ace> = Map().withMutations((mutableMap) => {
        mutableMap.set(dataSetKey, localPermissions.get(dataSetKey));
        dataSetColumns.forEach((column :Map) => {
          const columnId :UUID = column.get(ID);
          const key :List<List<UUID>> = List([dataSetId, columnId]);
          const isOwner = myKeys.has(key);
          if (isOwner) {
            const propertyType :?PropertyType = maybePropertyTypes.get(columnId);
            const pii :?boolean = propertyType?.pii;
            if (_isBoolean(pii)) {
              const localAce :?Ace = localPermissions.get(key);
              let updatedAcePermissions :Set<PermissionType> = Set(localAce?.permissions);
              if (pii === false) {
                updatedAcePermissions = updatedAcePermissions.add(permissionType);
              }
              else {
                updatedAcePermissions = updatedAcePermissions.delete(permissionType);
              }
              const updatedAce = (new AceBuilder())
                .setPermissions(updatedAcePermissions)
                .setPrincipal(principal)
                .build();
              mutableMap.set(key, updatedAce);
            }
          }
        });
      });
      setLocalPermissions(updatedPermissions);
    }
  };

  // TODO: setPermissionsRS update ui with SUCCESS/FAILURE states

  return (
    <Panel>
      <PanelHeader>
        <Typography variant="h1">{_capitalize(permissionType)}</Typography>
        <IconButton aria-label="close permissions panel" onClick={onClose}>
          <FontAwesomeIcon color={NEUTRAL.N800} fixedWidth icon={faTimes} size="lg" />
        </IconButton>
      </PanelHeader>
      <Divider isVisible={false} margin={24} />
      <div>
        <CardSegment padding="8px 0">
          <SpaceBetweenGrid>
            <Typography>Data Set</Typography>
            <ObjectPermissionCheckbox
                ace={localPermissions.get(dataSetKey)}
                isAuthorized={myKeys.has(dataSetKey)}
                objectKey={dataSetKey}
                onChange={handleOnChangePermission}
                permissionType={permissionType} />
          </SpaceBetweenGrid>
        </CardSegment>
        <CardSegment padding="8px 0">
          <SpaceBetweenGrid>
            <Typography>All columns</Typography>
            <IconButton
                aria-label="permissions toggle for all columns"
                onClick={togglePermissionAssignmentAll}>
              <FontAwesomeIcon
                  color={isPermissionAssignedToAll ? PURPLE.P300 : NEUTRAL.N500}
                  fixedWidth
                  icon={faToggleOn}
                  size="lg"
                  transform={{ rotate: isPermissionAssignedToAll ? 0 : 180 }} />
            </IconButton>
          </SpaceBetweenGrid>
        </CardSegment>
        <CardSegment padding="8px 0">
          <SpaceBetweenGrid>
            <Typography>Only non-pii columns</Typography>
            <IconButton
                aria-label="permissions toggle for only non-pii columns"
                onClick={togglePermissionAssignmentOnlyNonPII}>
              <FontAwesomeIcon
                  color={isPermissionAssignedToOnlyNonPII ? PURPLE.P300 : NEUTRAL.N500}
                  fixedWidth
                  icon={faToggleOn}
                  size="lg"
                  transform={{ rotate: isPermissionAssignedToOnlyNonPII ? 0 : 180 }} />
            </IconButton>
          </SpaceBetweenGrid>
        </CardSegment>
        {
          dataSetColumns.valueSeq().map((column :Map) => {
            const columnId :UUID = column.get(ID);
            const columnName :string = column.get(NAME);
            const columnTitle :string = column.getIn([METADATA, TITLE]);
            const key :List<UUID> = List([dataSetId, columnId]);
            const ace :?Ace = localPermissions.get(key);
            return (
              <CardSegment key={columnId} padding="8px 0">
                <SpaceBetweenGrid>
                  <div>
                    <Typography>{columnTitle}</Typography>
                    {
                      FQN.isValid(columnName) && (
                        <Typography variant="caption">{columnName}</Typography>
                      )
                    }
                  </div>
                  <ObjectPermissionCheckbox
                      ace={ace}
                      isAuthorized={myKeys.has(key)}
                      objectKey={key}
                      onChange={handleOnChangePermission}
                      permissionType={permissionType} />
                </SpaceBetweenGrid>
              </CardSegment>
            );
          })
        }
      </div>
      <Divider isVisible={false} margin={24} />
      <ButtonsWrapper>
        <Button
            aria-label="save permissions changes"
            color="primary"
            disabled={arePermissionsEqual}
            isLoading={isPending(setPermissionsRS)}
            onClick={handleOnClickSave}>
          Save
        </Button>
        <IconButton aria-label="reset permissions" onClick={resetPermissions}>
          <FontAwesomeIcon color={NEUTRAL.N800} fixedWidth icon={faUndo} size="lg" />
        </IconButton>
      </ButtonsWrapper>
    </Panel>
  );
};

export default PermissionsPanel;
