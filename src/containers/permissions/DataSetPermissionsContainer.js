/*
 * @flow
 */

import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';

import { List, Map } from 'immutable';
import { DataSetMetadataApiActions } from 'lattice-sagas';
import { PaginationToolbar, Typography } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type {
  Ace,
  PermissionType,
  Principal,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  MAX_HITS_10,
  PAGE,
  PAGE_PERMISSIONS_BY_DATA_SET,
  PERMISSIONS,
  RESET,
  TOTAL_PERMISSIONS,
} from '~/common/constants';
import { Spinner, StackGrid } from '~/components';
import {
  ASSIGN_PERMISSIONS_TO_DATA_SET,
  GET_DATA_SET_PERMISSIONS_PAGE,
  SET_PERMISSIONS,
  getDataSetPermissionsPage,
} from '~/core/permissions/actions';
import { resetRequestStates } from '~/core/redux/actions';
import { selectDataSetPermissionsPage } from '~/core/redux/selectors';
import type { DataSetPermissionTypeSelection } from '~/common/types';

import DataSetPermissionsCard from './DataSetPermissionsCard';

const {
  GET_DATA_SET_COLUMNS_METADATA,
  GET_ORGANIZATION_DATA_SETS_METADATA,
} = DataSetMetadataApiActions;

const {
  isPending,
  isSuccess,
  pagination,
} = ReduxUtils;

const DataSetPermissionsContainer = ({
  filterByFlag,
  filterByPermissionTypes,
  filterByQuery,
  onSelect,
  organizationId,
  principal,
  selection,
} :{|
  filterByFlag :?string;
  filterByPermissionTypes :Array<PermissionType>;
  filterByQuery :string;
  onSelect :(selection :?DataSetPermissionTypeSelection) => void;
  organizationId :UUID;
  principal :Principal;
  selection :?DataSetPermissionTypeSelection;
|}) => {

  const dispatch = useDispatch();

  const shouldInitialize = useRef(true);
  const [openDataSetId, setOpenDataSetId] = useState('');
  const [paginationState, paginationDispatch] = useReducer(pagination.reducer, pagination.INITIAL_STATE);
  const { page, start } = paginationState;

  const assignPermissionsToDataSetRS :?RequestState = useRequestState([PERMISSIONS, ASSIGN_PERMISSIONS_TO_DATA_SET]);
  const getDataSetPermissionsPageRS :?RequestState = useRequestState([PERMISSIONS, GET_DATA_SET_PERMISSIONS_PAGE]);
  const setPermissionsRS :?RequestState = useRequestState([PERMISSIONS, SET_PERMISSIONS]);

  const dataSetPermissionsPage :Map = useSelector(selectDataSetPermissionsPage());
  const totalPermissions :number = dataSetPermissionsPage.get(TOTAL_PERMISSIONS) || 0;
  const pagePermissionsByDataSet :Map<UUID, Map<List<UUID>, Ace>> = (
    dataSetPermissionsPage.get(PAGE_PERMISSIONS_BY_DATA_SET) || Map()
  );

  useEffect(() => () => {
    dispatch(
      resetRequestStates([
        GET_DATA_SET_PERMISSIONS_PAGE,
        GET_DATA_SET_COLUMNS_METADATA,
        GET_ORGANIZATION_DATA_SETS_METADATA,
      ])
    );
  }, [dispatch]);

  useEffect(() => {
    if (shouldInitialize.current === true && isSuccess(getDataSetPermissionsPageRS)) {
      shouldInitialize.current = false;
    }
  }, [getDataSetPermissionsPageRS]);

  const dispatchGetDataSetPermissionsPage = useCallback(() => {
    dispatch(
      getDataSetPermissionsPage({
        filterByFlag,
        filterByPermissionTypes,
        filterByQuery,
        initialize: shouldInitialize.current,
        organizationId,
        pageSize: MAX_HITS_10,
        principal,
        start,
      })
    );
  }, [
    dispatch,
    filterByFlag,
    filterByPermissionTypes,
    filterByQuery,
    organizationId,
    principal,
    start,
  ]);

  useEffect(() => {
    dispatchGetDataSetPermissionsPage();
  }, [dispatchGetDataSetPermissionsPage]);

  useEffect(() => {
    // NOTE: refresh when permissions are assigned via AssignPermissionsToDataSetModal
    if (isSuccess(assignPermissionsToDataSetRS)) {
      dispatchGetDataSetPermissionsPage();
    }
  }, [assignPermissionsToDataSetRS, dispatchGetDataSetPermissionsPage]);

  useEffect(() => {
    // NOTE: refresh when permissions are changed via PermissionsPanel
    if (isSuccess(setPermissionsRS)) {
      dispatchGetDataSetPermissionsPage();
    }
  }, [dispatchGetDataSetPermissionsPage, setPermissionsRS]);

  useEffect(() => {
    paginationDispatch({ type: RESET });
  }, [filterByPermissionTypes, filterByQuery]);

  const handleOnPageChange = (state) => {
    paginationDispatch({
      page: state.page,
      start: state.start,
      type: PAGE,
    });
    onSelect();
  };

  const toggleOpenDataSetCard = (dataSetId :UUID) => {
    if (openDataSetId === dataSetId) {
      setOpenDataSetId('');
    }
    else {
      setOpenDataSetId(dataSetId);
    }
  };

  return (
    <StackGrid gap={8}>
      {
        isPending(getDataSetPermissionsPageRS) && (
          <Spinner />
        )
      }
      {
        isSuccess(getDataSetPermissionsPageRS) && totalPermissions === 0 && (
          <Typography align="center">No datasets.</Typography>
        )
      }
      {
        isSuccess(getDataSetPermissionsPageRS) && totalPermissions !== 0 && (
          pagePermissionsByDataSet.map((permissions :Map<List<UUID>, Ace>, dataSetId :UUID) => (
            <DataSetPermissionsCard
                dataSetId={dataSetId}
                dataSetPermissions={permissions}
                isOpen={openDataSetId === dataSetId}
                key={dataSetId} // eslint-disable-line react/no-array-index-key
                onClick={toggleOpenDataSetCard}
                onSelect={onSelect}
                organizationId={organizationId}
                selection={selection} />
          )).valueSeq()
        )
      }
      {
        totalPermissions > MAX_HITS_10 && (
          <PaginationToolbar
              count={totalPermissions}
              onPageChange={handleOnPageChange}
              page={page}
              rowsPerPage={MAX_HITS_10} />
        )
      }
    </StackGrid>
  );
};

export default DataSetPermissionsContainer;
