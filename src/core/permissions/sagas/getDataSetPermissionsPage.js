/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, Set } from 'immutable';
import { Types } from 'lattice';
import { DataSetMetadataApiActions, DataSetMetadataApiSagas } from 'lattice-sagas';
import { AxiosUtils, LangUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type {
  Ace,
  Organization,
  PermissionType,
  Principal,
  UUID,
} from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  ERR_MISSING_ORG,
  FLAGS,
  ID,
  METADATA,
  PAGE_PERMISSIONS_BY_DATA_SET,
  TITLE,
  TOTAL_PERMISSIONS,
} from '~/common/constants';
import {
  selectOrgDataSets,
  selectOrgDataSetsColumns,
  selectOrganization,
  selectPrincipalPermissions,
} from '~/core/redux/selectors';

import { getPermissionsWorker } from './getPermissions';

import { GET_DATA_SET_PERMISSIONS_PAGE, getDataSetPermissionsPage, getPermissions } from '../actions';

const { getDataSetColumnsMetadata, getOrganizationDataSetsMetadata } = DataSetMetadataApiActions;
const { getDataSetColumnsMetadataWorker, getOrganizationDataSetsMetadataWorker } = DataSetMetadataApiSagas;
const { EntitySetFlagTypes } = Types;
const { toSagaError } = AxiosUtils;
const { isDefined, isNonEmptyArray, isNonEmptyString } = LangUtils;

const LOG = new Logger('PermissionsSagas');

function* getDataSetPermissionsPageWorker(action :SequenceAction) :Saga<void> {

  try {
    yield put(getDataSetPermissionsPage.request(action.id, action.value));

    const {
      filterByFlag,
      filterByPermissionTypes,
      filterByQuery,
      initialize,
      organizationId,
      pageSize,
      principal,
      start,
    } :{|
      filterByFlag :?string;
      filterByPermissionTypes :Array<PermissionType>;
      filterByQuery :string;
      initialize :boolean;
      organizationId :UUID;
      pageSize :number;
      principal :Principal;
      start :number;
    |} = action.value;
    let response :WorkerResponse;

    const organization :?Organization = yield select(selectOrganization(organizationId));
    if (!organization) {
      throw new Error(ERR_MISSING_ORG);
    }

    if (initialize === true) {
      // NOTE: we only want to call getOrganizationDataSetsMetadata once, not for every page
      // NOTE: we don't need response.data because the redux store will be populated
      response = yield call(getOrganizationDataSetsMetadataWorker, getOrganizationDataSetsMetadata(organizationId));
      if (response.error) throw response.error;
    }

    const dataSets :Map<UUID, Map> = yield select(selectOrgDataSets(organizationId));
    const dataSetKeys :List<List<UUID>> = dataSets.keySeq().map((dataSetId :UUID) => List([dataSetId])).toList();

    if (initialize === true) {
      // NOTE: we only want to call getPermissions once, not for every page
      // NOTE: we don't need response.data because the redux store will be populated
      response = yield call(getPermissionsWorker, getPermissions(dataSetKeys));
      if (response.error) throw response.error;
    }

    let permissions :Map<List<UUID>, Ace> = yield select(selectPrincipalPermissions(dataSetKeys, principal));
    permissions = permissions.filter((ace :Ace, key :List<UUID>) => {
      const dataSetId :UUID = key.get(0);
      const dataSet :Map = dataSets.get(dataSetId);
      const dataSetTitle :string = dataSet.getIn([METADATA, TITLE]);
      const dataSetFlags :List<string> = dataSet.getIn([METADATA, FLAGS]);
      const includeBasedOnQuery = isNonEmptyString(filterByQuery)
        // include when title contains filter query (if given)
        ? dataSetTitle.toLowerCase().includes(filterByQuery.toLowerCase())
        // otherwise always include (default case)
        : true;
      const includeBasedOnPermissionTypes = isNonEmptyArray(filterByPermissionTypes)
        // include when permission types match all filter permission types (if given)
        ? filterByPermissionTypes.every((pt :PermissionType) => ace?.permissions.includes(pt))
        // otherwise always include (default case)
        : true;
      const includeBasedOnFlag = isDefined(filterByFlag)
        // include when flags contain the filter flag (if given)
        ? dataSetFlags.some((flag :string) => flag === filterByFlag)
        // otherwise, do not include AUDIT entity sets (default case)
        : !dataSetFlags.some((flag :string) => flag === EntitySetFlagTypes.AUDIT);
      return includeBasedOnQuery && includeBasedOnPermissionTypes && includeBasedOnFlag;
    });

    // NOTE: these are the data set ids for this page
    const pageDataSetIds :Set<UUID> = permissions
      .slice(start, start + pageSize)
      .keySeq()
      .flatten()
      .toSet();

    if (pageDataSetIds.isEmpty()) {
      yield put(getDataSetPermissionsPage.success(action.id, Map({
        [PAGE_PERMISSIONS_BY_DATA_SET]: Map(),
        [TOTAL_PERMISSIONS]: 0,
      })));
    }
    else {
      // NOTE: we don't need response.data because the redux store will be populated
      response = yield call(getDataSetColumnsMetadataWorker, getDataSetColumnsMetadata(pageDataSetIds.toJS()));
      if (response.error) throw response.error;

      const pageDataSetColumns :Map<UUID, Map> = yield select(
        selectOrgDataSetsColumns(organizationId, pageDataSetIds)
      );
      const pageDataSetColumnKeys :List<List<UUID>> = List().withMutations((mutableList) => {
        pageDataSetColumns.forEach((dataSetColumns :Map<UUID, Map>, dataSetId :UUID) => {
          dataSetColumns.forEach((column :Map) => {
            mutableList.push(List([dataSetId, column.get(ID)]));
          });
        });
      });

      // NOTE: we don't need response.data because the redux store will be populated
      response = yield call(getPermissionsWorker, getPermissions(pageDataSetColumnKeys));
      if (response.error) throw response.error;

      const pageDataSetKeys :List<List<UUID>> = pageDataSetIds.map((dataSetId :UUID) => List([dataSetId])).toList();
      const pageKeys :List<List<UUID>> = pageDataSetKeys.concat(pageDataSetColumnKeys);

      const pagePermissions :Map<List<UUID>, Ace> = yield select(selectPrincipalPermissions(pageKeys, principal));
      const pagePermissionsByDataSet :Map<UUID, Map<List<UUID>, Ace>> = Map().withMutations((mutableMap) => {
        pagePermissions.forEach((ace :Ace, key) => {
          const dataSetId :UUID = key.get(0);
          mutableMap.mergeIn([dataSetId], Map([[key, ace]]));
        });
      });

      yield put(getDataSetPermissionsPage.success(action.id, Map({
        [PAGE_PERMISSIONS_BY_DATA_SET]: pagePermissionsByDataSet,
        [TOTAL_PERMISSIONS]: permissions.count(),
      })));
    }
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getDataSetPermissionsPage.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(getDataSetPermissionsPage.finally(action.id));
  }
}

function* getDataSetPermissionsPageWatcher() :Saga<*> {

  yield takeEvery(
    GET_DATA_SET_PERMISSIONS_PAGE,
    getDataSetPermissionsPageWorker,
  );
}

export {
  getDataSetPermissionsPageWatcher,
  getDataSetPermissionsPageWorker,
};
