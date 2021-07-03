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
import { Modal, PaginationToolbar, Typography } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type {
  Ace,
  FQN,
  PermissionType,
  Principal,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { MAX_HITS_10, PAGE, PERMISSIONS } from '~/common/constants';
import { getDataSetKeys, getPrincipalTitle } from '~/common/utils';
import { Spinner, StackGrid } from '~/components';
import { INITIALIZE_OBJECT_PERMISSIONS, initializeObjectPermissions } from '~/core/permissions/actions';
import {
  selectOrgDataSet,
  selectOrgDataSetColumns,
  selectPermissionsByPrincipal,
  selectUsers,
} from '~/core/redux/selectors';

import ObjectPermissionsCard from './ObjectPermissionsCard';
import { AssignPermissionsToObjectModalBody } from './assign-permissions-to-object';

const {
  isPending,
  isSuccess,
  pagination,
} = ReduxUtils;

const ObjectPermissionsContainer = ({
  filterByPermissionTypes,
  filterByQuery,
  isDataSet,
  isVisibleAssignPermissionsModal,
  objectKey,
  onClosePermissionsModal,
  organizationId
} :{|
  filterByPermissionTypes :Array<PermissionType>;
  filterByQuery :string;
  isDataSet :boolean;
  isVisibleAssignPermissionsModal :boolean;
  objectKey :List<UUID>;
  onClosePermissionsModal :() => void;
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();

  const [paginationState, paginationDispatch] = useReducer(pagination.reducer, pagination.INITIAL_STATE);
  const { page, start } = paginationState;

  const initializeRS :?RequestState = useRequestState([PERMISSIONS, INITIALIZE_OBJECT_PERMISSIONS]);
  const requestIsPending :boolean = isPending(initializeRS);
  const requestIsSuccess :boolean = isSuccess(initializeRS);

  const users :Map<string, Map> = useSelector(selectUsers());
  const usersHash :number = users.hashCode();
  const thisUserInfo = AuthUtils.getUserInfo() || { id: '' };
  const thisUserId = thisUserInfo.id;

  const maybeDataSetId :UUID = isDataSet ? objectKey.get(0) : '';
  const maybeDataSet :Map<FQN, List> = useSelector(selectOrgDataSet(organizationId, maybeDataSetId));
  const maybeDataSetColumns :Map<UUID, Map> = useSelector(selectOrgDataSetColumns(organizationId, maybeDataSetId));

  const keys :List<List<UUID>> = useMemo(() => {
    if (isDataSet) {
      // data set object
      return getDataSetKeys(maybeDataSet, maybeDataSetColumns);
    }
    // organization / role object
    return List().push(objectKey);
  }, [
    isDataSet,
    maybeDataSet,
    maybeDataSetColumns,
    objectKey,
  ]);

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
    permissions,
    permissionsHash,
    thisUserId,
    users,
    usersHash
  ]);

  const filteredPermissionsCount :number = filteredPermissions.count();
  const pagePermissions :Map<Principal, Map<List<UUID>, Ace>> = filteredPermissions.slice(start, start + MAX_HITS_10);

  useEffect(() => {
    dispatch(initializeObjectPermissions({ isDataSet, objectKey, organizationId }));
  }, [dispatch, isDataSet, objectKey, organizationId]);

  const handleOnPageChange = (state) => {
    paginationDispatch({
      page: state.page,
      start: state.start,
      type: PAGE,
    });
  };

  return (
    <StackGrid gap={0}>
      {
        requestIsPending && (
          <Spinner />
        )
      }
      {
        requestIsSuccess && filteredPermissionsCount === 0 && (
          <Typography align="center">No permissions assigned.</Typography>
        )
      }
      {
        requestIsSuccess && filteredPermissionsCount !== 0 && (
          pagePermissions.map((principalPermissions :Map<List<UUID>, Ace>, principal :Principal) => (
            <ObjectPermissionsCard
                dataSetColumns={maybeDataSetColumns}
                isDataSet={isDataSet}
                key={principal.id}
                objectKey={objectKey}
                permissions={principalPermissions}
                principal={principal} />
          )).valueSeq()
        )
      }
      {
        filteredPermissionsCount > MAX_HITS_10 && (
          <PaginationToolbar
              count={filteredPermissionsCount}
              onPageChange={handleOnPageChange}
              page={page}
              rowsPerPage={MAX_HITS_10} />
        )
      }
      <Modal
          isVisible={isVisibleAssignPermissionsModal}
          onClose={onClosePermissionsModal}
          shouldCloseOnOutsideClick={false}
          textTitle="Assign Permissions To Object"
          viewportScrolling
          withFooter={false}>
        <AssignPermissionsToObjectModalBody
            existingPermissions={permissions}
            isDataSet={isDataSet}
            objectKey={objectKey}
            onClose={onClosePermissionsModal}
            organizationId={organizationId} />
      </Modal>
    </StackGrid>
  );
};

export default ObjectPermissionsContainer;
