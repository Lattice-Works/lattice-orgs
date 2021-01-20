/*
 * @flow
 */

import React, {
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import { List, Map } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { PaginationToolbar, Typography } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
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

import ObjectPermissionsCard from './ObjectPermissionsCard';

import { Spinner, StackGrid } from '../../components';
import { INITIALIZE_OBJECT_PERMISSIONS, initializeObjectPermissions } from '../../core/permissions/actions';
import { PERMISSIONS } from '../../core/redux/constants';
import {
  selectDataSetProperties,
  selectPermissionsByPrincipal,
  selectUsers,
} from '../../core/redux/selectors';
import { getDataSetKeys, getPrincipalTitle } from '../../utils';
import { INITIAL_PAGINATION_STATE, PAGE, paginationReducer } from '../../utils/stateReducers/pagination';
import type { State as PaginationState } from '../../utils/stateReducers/pagination';

const MAX_PER_PAGE = 10;

const ObjectPermissionsContainer = ({
  filterByPermissionTypes,
  filterByQuery,
  isDataSet,
  objectKey,
  organizationId,
} :{|
  filterByPermissionTypes :Array<PermissionType>;
  filterByQuery :string;
  isDataSet :boolean;
  objectKey :List<UUID>;
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();

  const [paginationState, paginationDispatch] = useReducer(paginationReducer, INITIAL_PAGINATION_STATE);
  const { page, start } = paginationState;

  const initializeRS :?RequestState = useRequestState([PERMISSIONS, INITIALIZE_OBJECT_PERMISSIONS]);

  const users :Map<string, Map> = useSelector(selectUsers());
  const usersHash :number = users.hashCode();
  const thisUserInfo = AuthUtils.getUserInfo() || { id: '' };
  const thisUserId = thisUserInfo.id;

  const properties :Map<UUID, PropertyType | Map> = useSelector(selectDataSetProperties(objectKey.get(0)));
  const keys :List<List<UUID>> = useMemo(() => {
    if (isDataSet) {
      // data set object
      return getDataSetKeys(objectKey.get(0), properties.keySeq().toSet());
    }
    // organization / role object
    return List().push(objectKey);
  }, [isDataSet, objectKey, properties]);

  const permissions :Map<Principal, Map<List<UUID>, Ace>> = useSelector(selectPermissionsByPrincipal(keys));
  const permissionsHash :number = permissions.hashCode();

  const filteredPermissions :Map<Principal, Map<List<UUID>, Ace>> = useMemo(() => (
    permissions.filter((principalPermissions :Map<List<UUID>, Ace>, principal :Principal) => {
      const principalTitle = getPrincipalTitle(principal, users.get(principal.id), thisUserId);
      const ace :?Ace = principalPermissions.get(objectKey);
      return (
        // TODO: this is probably not good enough, plan to revisit
        principalTitle.toLowerCase().includes(filterByQuery.toLowerCase())
        && filterByPermissionTypes.every((pt :PermissionType) => ace?.permissions.includes(pt))
      );
    })
  ), [
    filterByPermissionTypes,
    filterByQuery,
    objectKey,
    permissionsHash,
    thisUserId,
    usersHash,
  ]);

  const filteredPermissionsCount :number = filteredPermissions.count();
  const pagePermissions :Map<Principal, Map<List<UUID>, Ace>> = filteredPermissions.slice(start, start + MAX_PER_PAGE);

  useEffect(() => {
    dispatch(initializeObjectPermissions({ isDataSet, objectKey, organizationId }));
  }, [dispatch, isDataSet, objectKey, organizationId]);

  const handleOnPageChange = (state :PaginationState) => {
    paginationDispatch({
      page: state.page,
      start: state.start,
      type: PAGE,
    });
  };

  return (
    <StackGrid gap={0}>
      {
        initializeRS === RequestStates.PENDING && (
          <Spinner />
        )
      }
      {
        initializeRS === RequestStates.SUCCESS && filteredPermissionsCount === 0 && (
          <Typography align="center">No permissions assigned.</Typography>
        )
      }
      {
        initializeRS === RequestStates.SUCCESS && filteredPermissionsCount !== 0 && (
          pagePermissions.map((principalPermissions :Map<List<UUID>, Ace>, principal :Principal) => (
            <ObjectPermissionsCard
                isDataSet={isDataSet}
                key={principal.id}
                objectKey={objectKey}
                permissions={principalPermissions}
                principal={principal}
                properties={properties} />
          )).valueSeq()
        )
      }
      {
        filteredPermissionsCount > MAX_PER_PAGE && (
          <PaginationToolbar
              count={filteredPermissionsCount}
              onPageChange={handleOnPageChange}
              page={page}
              rowsPerPage={MAX_PER_PAGE} />
        )
      }
    </StackGrid>
  );
};

ObjectPermissionsContainer.defaultProps = {
  isDataSet: false,
};

export default ObjectPermissionsContainer;