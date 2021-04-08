/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import _isBoolean from 'lodash/isBoolean';
import styled from 'styled-components';
import { faToggleOn } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map, Set } from 'immutable';
import { Models, Types } from 'lattice';
import { Colors, IconButton, Typography } from 'lattice-ui-kit';
import { DataUtils, ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type {
  Ace,
  FQN,
  PermissionType,
  Principal,
  PropertyType,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { SpaceBetweenGrid, Spinner } from '../../components';
import { FQNS } from '../../core/edm/constants';
import {
  UPDATE_PERMISSIONS,
  UPDATE_PERMISSIONS_BULK,
  updatePermissions,
  updatePermissionsBulk,
} from '../../core/permissions/actions';
import { PERMISSIONS } from '../../core/redux/constants';
import { selectMyKeys, selectPropertyTypes } from '../../core/redux/selectors';

const { NEUTRAL, PURPLE } = Colors;
const { AceBuilder } = Models;
const { ActionTypes } = Types;
const { getPropertyValue } = DataUtils;
const { isPending } = ReduxUtils;

const ToggleWrapper = styled.div`
  display: flex;
  margin-right: -10px; /* for alignment with toggle icon */
  min-height: 40px;
`;

const DataSetColumnPermissionsSection = ({
  dataSetColumns,
  objectKey,
  permissions,
  permissionType,
  principal,
} :{|
  dataSetColumns :List<Map<FQN, List>>;
  objectKey :List<UUID>;
  permissions :Map<List<UUID>, Ace>;
  permissionType :PermissionType;
  principal :Principal;
|}) => {

  const [isPermissionAssignedToAll, setIsPermissionAssignedToAll] = useState(false);
  const [isPermissionAssignedToOnlyNonPII, setIsPermissionAssignedToOnlyNonPII] = useState(false);

  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());
  const aceForUpdate = (new AceBuilder()).setPermissions([permissionType]).setPrincipal(principal).build();

  const dispatch = useDispatch();

  const columnIds :List<UUID> = useMemo(() => (
    dataSetColumns.map((column :Map<FQN, List>) => getPropertyValue(column, [FQNS.OL_ID, 0]))
  ), [dataSetColumns]);
  const maybePropertyTypes :Map<UUID, PropertyType> = useSelector(selectPropertyTypes(columnIds));
  const propertyTypesHash :number = maybePropertyTypes.hashCode();

  useEffect(() => {
    let isAssignedToAll = true;
    let isAssignedToOnlyNonPII = true;
    dataSetColumns.forEach((column :Map<FQN, List>) => {
      const columnId :UUID = getPropertyValue(column, [FQNS.OL_ID, 0]);
      const propertyType :?PropertyType = maybePropertyTypes.get(columnId);
      const pii :boolean = propertyType?.pii || false;
      const key :List<UUID> = List([objectKey.get(0), columnId]);
      const isOwner = myKeys.has(key);
      if (isOwner) {
        const ace :?Ace = permissions.get(key);
        const isPermissionAssigned = ace ? ace.permissions.includes(permissionType) : false;
        isAssignedToAll = isAssignedToAll && isPermissionAssigned;
        if ((isPermissionAssigned && pii === true) || (!isPermissionAssigned && pii === false)) {
          isAssignedToOnlyNonPII = false;
        }
      }
    });
    setIsPermissionAssignedToAll(isAssignedToAll);
    setIsPermissionAssignedToOnlyNonPII(isAssignedToOnlyNonPII);
  }, [
    dataSetColumns,
    myKeys,
    objectKey,
    permissions,
    permissionType,
    propertyTypesHash,
  ]);

  const updatePermissionsRS :?RequestState = useRequestState([PERMISSIONS, UPDATE_PERMISSIONS]);
  const updatePermissionsBulkRS :?RequestState = useRequestState([PERMISSIONS, UPDATE_PERMISSIONS_BULK]);

  const togglePermissionAssignmentToAll = () => {
    if (!isPending(updatePermissionsRS)) {
      const permissionsToUpdate = Map().withMutations((mutator) => {
        dataSetColumns.forEach((column :Map<FQN, List>) => {
          const columnId :UUID = getPropertyValue(column, [FQNS.OL_ID, 0]);
          const key :List<UUID> = List([objectKey.get(0), columnId]);
          if (myKeys.has(key)) {
            mutator.set(key, aceForUpdate);
          }
        });
      });
      dispatch(
        updatePermissions({
          actionType: isPermissionAssignedToAll ? ActionTypes.REMOVE : ActionTypes.ADD,
          permissions: permissionsToUpdate
        })
      );
      setIsPermissionAssignedToAll(!isPermissionAssignedToAll);
    }
  };

  const togglePermissionAssignmentToOnlyNonPII = () => {
    if (!isPending(updatePermissionsRS) || !isPending(updatePermissionsBulkRS)) {
      if (!isPermissionAssignedToOnlyNonPII) {

        const permissionsToUpdate :Object[] = [];

        const permissionsToAdd :Map<List<UUID>, Ace> = Map().asMutable();
        const permissionsToRemove :Map<List<UUID>, Ace> = Map().withMutations((mutator) => {
          dataSetColumns.forEach((column :Map<FQN, List>) => {
            const columnId :UUID = getPropertyValue(column, [FQNS.OL_ID, 0]);
            const key :List<UUID> = List([objectKey.get(0), columnId]);
            const isOwner = myKeys.has(key);
            if (isOwner) {
              const propertyType :?PropertyType = maybePropertyTypes.get(columnId);
              const pii :?boolean = propertyType?.pii;
              if (_isBoolean(pii)) {
                if (pii === false) {
                  permissionsToAdd.set(key, aceForUpdate);
                }
                else {
                  mutator.set(key, aceForUpdate);
                }
              }
            }
          });
        });
        if (!permissionsToAdd.isEmpty()) {
          permissionsToUpdate.push({
            actionType: ActionTypes.ADD,
            permissions: permissionsToAdd.asImmutable()
          });
        }
        if (!permissionsToRemove.isEmpty()) {
          permissionsToUpdate.push({
            actionType: ActionTypes.REMOVE,
            permissions: permissionsToRemove
          });
        }
        dispatch(updatePermissionsBulk(permissionsToUpdate));
        setIsPermissionAssignedToOnlyNonPII(isPermissionAssignedToOnlyNonPII);
      }
      else {
        const permissionsToUpdate = Map().withMutations((mutator) => {
          dataSetColumns.forEach((column :Map<FQN, List>) => {
            const columnId :UUID = getPropertyValue(column, [FQNS.OL_ID, 0]);
            const key :List<UUID> = List([objectKey.get(0), columnId]);
            if (myKeys.has(key)) {
              mutator.set(key, aceForUpdate);
            }
          });
        });
        dispatch(
          updatePermissions({
            actionType: ActionTypes.REMOVE,
            permissions: permissionsToUpdate
          })
        );
        setIsPermissionAssignedToOnlyNonPII(!isPermissionAssignedToOnlyNonPII);
      }
    }
  };

  return (
    <>
      <SpaceBetweenGrid>
        <Typography>All Columns</Typography>
        <ToggleWrapper>
          {
            isPending(updatePermissionsRS)
              ? (
                <Spinner size="lg" />
              )
              : (
                <IconButton
                    aria-label="all columns toggle open/close"
                    onClick={togglePermissionAssignmentToAll}>
                  <FontAwesomeIcon
                      color={isPermissionAssignedToAll ? PURPLE.P300 : NEUTRAL.N500}
                      fixedWidth
                      icon={faToggleOn}
                      size="lg"
                      transform={{ rotate: isPermissionAssignedToAll ? 0 : 180 }} />
                </IconButton>
              )
          }
        </ToggleWrapper>
      </SpaceBetweenGrid>
      <SpaceBetweenGrid>
        <Typography>Only Non-PII Columns</Typography>
        <ToggleWrapper>
          {
            isPending(updatePermissionsBulkRS)
              ? (
                <Spinner size="lg" />
              )
              : (
                <IconButton
                    aria-label="non-pii columns toggle open/close"
                    onClick={togglePermissionAssignmentToOnlyNonPII}>
                  <FontAwesomeIcon
                      color={isPermissionAssignedToOnlyNonPII ? PURPLE.P300 : NEUTRAL.N500}
                      fixedWidth
                      icon={faToggleOn}
                      size="lg"
                      transform={{ rotate: isPermissionAssignedToOnlyNonPII ? 0 : 180 }} />
                </IconButton>
              )
          }
        </ToggleWrapper>
      </SpaceBetweenGrid>
    </>
  );
};

export default DataSetColumnPermissionsSection;
