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
import {
  List,
  Map,
  Set,
  get,
} from 'immutable';
import { Models } from 'lattice';
import {
  Button,
  CardSegment,
  Checkbox,
  Colors,
  IconButton,
  Sizes,
  StyleUtils,
  Typography,
} from 'lattice-ui-kit';
import { DataUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type {
  Ace,
  PermissionType,
  Principal,
  PropertyType,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { Divider, SpaceBetweenGrid } from '../../components';
import { FQNS } from '../../core/edm/constants';
import { SET_PERMISSIONS, setPermissions } from '../../core/permissions/actions';
import { PERMISSIONS } from '../../core/redux/constants';
import {
  selectOrgDataSet,
  selectOrgDataSetColumns,
  selectPrincipalPermissions,
  selectPropertyTypes,
} from '../../core/redux/selectors';
import { getDataSetKeys } from '../../utils';

const { NEUTRAL, PURPLE } = Colors;
const { APP_CONTENT_PADDING } = Sizes;
const { media } = StyleUtils;
const { AceBuilder, FQN } = Models;
const { getPropertyValue } = DataUtils;

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
  const [isPermissionAssignedToDataSet, setIsPermissionAssignedToDataSet] = useState(false);
  const [isPermissionAssignedToOnlyNonPII, setIsPermissionAssignedToOnlyNonPII] = useState(false);
  const [localPermissions, setLocalPermissions] = useState(Map());

  const setPermissionsRS :?RequestState = useRequestState([PERMISSIONS, SET_PERMISSIONS]);

  const dataSet :Map<FQN, List> = useSelector(selectOrgDataSet(organizationId, dataSetId));
  const dataSetColumns :List<Map<FQN, List>> = useSelector(selectOrgDataSetColumns(organizationId, dataSetId));

  const keys :List<List<UUID>> = useMemo(() => getDataSetKeys(dataSet, dataSetColumns), [dataSet, dataSetColumns]);
  const permissions :Map<List<UUID>, Ace> = useSelector(selectPrincipalPermissions(keys, principal));
  const permissionsHash :number = permissions.hashCode();

  useEffect(() => {
    setLocalPermissions(permissions);
  }, [permissionsHash]);

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
      const key :List<UUID> = List([dataSetId, columnId]);
      const ace :?Ace = localPermissions.get(key);
      const isPermissionAssigned = ace ? ace.permissions.includes(permissionType) : false;
      isAssignedToAll = isAssignedToAll && isPermissionAssigned;
      if (
        (isPermissionAssigned && pii === true)
        || (!isPermissionAssigned && pii === false)
      ) {
        isAssignedToOnlyNonPII = false;
      }
    });
    setIsPermissionAssignedToAll(isAssignedToAll);
    setIsPermissionAssignedToOnlyNonPII(isAssignedToOnlyNonPII);

    const ace :?Ace = localPermissions.get(List([dataSetId]));
    const isAssignedToDataSet = ace ? ace.permissions.includes(permissionType) : false;
    setIsPermissionAssignedToDataSet(isAssignedToDataSet);

  }, [
    dataSetColumns,
    dataSetId,
    localPermissions,
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

  const handleOnChangePermission = (event :SyntheticEvent<HTMLInputElement>) => {

    let key :List<UUID> = List([dataSetId]);
    if (event?.currentTarget?.dataset?.columnId) {
      const columnId :UUID = event.currentTarget.dataset.columnId;
      key = List([dataSetId, columnId]);
    }

    // add permission
    if (event.currentTarget.checked) {
      const updatedPermissions :Map<List<UUID>, Ace> = localPermissions.update(key, (ace :Ace) => {
        const updatedAcePermissions = Set(ace?.permissions).add(permissionType);
        return (new AceBuilder()).setPermissions(updatedAcePermissions).setPrincipal(principal).build();
      });
      setLocalPermissions(updatedPermissions);
    }
    // remove permission
    else {
      const updatedPermissions :Map<List<UUID>, Ace> = localPermissions.update(key, (ace :Ace) => {
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
      // remove permission from all properties
      const updatedPermissions :Map<List<UUID>, Ace> = Map().withMutations((mutableMap) => {
        const dataSetKey = List([dataSetId]);
        mutableMap.set(dataSetKey, localPermissions.get(dataSetKey));
        dataSetColumns.forEach((column :Map<FQN, List>) => {
          const columnId :UUID = getPropertyValue(column, [FQNS.OL_ID, 0]);
          const key = List([dataSetId, columnId]);
          const localAce :?Ace = localPermissions.get(key);
          const updatedAcePermissions = Set(localAce?.permissions).delete(permissionType);
          const updatedAce = (new AceBuilder())
            .setPermissions(updatedAcePermissions)
            .setPrincipal(principal)
            .build();
          mutableMap.set(key, updatedAce);
        });
      });
      setLocalPermissions(updatedPermissions);
    }
    else {
      // add permission to all properties
      const updatedPermissions :Map<List<UUID>, Ace> = Map().withMutations((mutableMap) => {
        const dataSetKey = List([dataSetId]);
        mutableMap.set(dataSetKey, localPermissions.get(dataSetKey));
        dataSetColumns.forEach((column :Map<FQN, List>) => {
          const columnId :UUID = getPropertyValue(column, [FQNS.OL_ID, 0]);
          const key = List([dataSetId, columnId]);
          const localAce :?Ace = localPermissions.get(key);
          const updatedAcePermissions = Set(localAce?.permissions).add(permissionType);
          const updatedAce = (new AceBuilder())
            .setPermissions(updatedAcePermissions)
            .setPrincipal(principal)
            .build();
          mutableMap.set(key, updatedAce);
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
        const dataSetKey = List([dataSetId]);
        mutableMap.set(dataSetKey, localPermissions.get(dataSetKey));
        dataSetColumns.forEach((column :Map<FQN, List>) => {
          const columnId :UUID = getPropertyValue(column, [FQNS.OL_ID, 0]);
          const propertyType :?PropertyType = maybePropertyTypes.get(columnId);
          const pii :?boolean = propertyType?.pii;
          if (_isBoolean(pii)) {
            const key :List<List<UUID>> = List([dataSetId, columnId]);
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
            <Checkbox checked={isPermissionAssignedToDataSet} onChange={handleOnChangePermission} />
          </SpaceBetweenGrid>
        </CardSegment>
        <CardSegment padding="8px 0">
          <SpaceBetweenGrid>
            <Typography>All properties</Typography>
            <IconButton
                aria-label="permissions toggle for all properties"
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
            <Typography>Only non-pii properties</Typography>
            <IconButton
                aria-label="permissions toggle for only non-pii properties"
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
          dataSetColumns.map((column :Map<FQN, List>) => {
            const columnId :UUID = getPropertyValue(column, [FQNS.OL_ID, 0]);
            const columnTitle :UUID = getPropertyValue(column, [FQNS.OL_TITLE, 0]);
            const columnType :string = getPropertyValue(column, [FQNS.OL_TYPE, 0]);
            const key :List<UUID> = List([dataSetId, columnId]);
            const ace :?Ace = localPermissions.get(key);
            const isPermissionAssigned = ace ? ace.permissions.includes(permissionType) : false;
            return (
              <CardSegment key={columnId} padding="8px 0">
                <SpaceBetweenGrid>
                  <div>
                    <Typography>{columnTitle}</Typography>
                    {
                      FQN.isValid(columnType) && (
                        <Typography variant="caption">{columnType}</Typography>
                      )
                    }
                  </div>
                  <Checkbox
                      checked={isPermissionAssigned}
                      data-column-id={columnId}
                      onChange={handleOnChangePermission} />
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
            isLoading={setPermissionsRS === RequestStates.PENDING}
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
