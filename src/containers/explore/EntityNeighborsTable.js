/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import { List, Map, get } from 'immutable';
import { Colors, PaginationToolbar, Table } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  DATA,
  MAX_HITS_10,
  METADATA,
  NAME,
  TITLE,
} from '~/common/constants';
import { DataTableWrapper } from '~/components';
import { FETCH_ENTITY_SET_DATA, fetchEntitySetData } from '~/core/data/actions';
import { resetRequestStates } from '~/core/redux/actions';
import { selectOrgDataSetColumns, selectOrgEntitySetData } from '~/core/redux/selectors';

import { EntityDataRow } from './components';

const { isPending, isSuccess } = ReduxUtils;
const { PURPLE } = Colors;

const EntityNeighborsTable = ({
  associationDataSet,
  isModal,
  neighborDataSet,
  neighbors,
  organizationId,
} :{|
  associationDataSet :Map,
  isModal :boolean;
  neighborDataSet :Map;
  neighbors :List<Map>;
  organizationId :UUID;
|}) => {

  const associationDataSetId :UUID = get(associationDataSet, 'id');
  const neighborDataSetId :UUID = get(neighborDataSet, 'id');

  const dispatch = useDispatch();
  const [tableData, setTableData] = useState([]);
  const [tablePage, setTablePage] = useState(1);
  const [neighborsIndex, setNeighborsIndex] = useState(0);

  const fetchEntitySetDataRS :?RequestState = useRequestState([DATA, FETCH_ENTITY_SET_DATA, neighborDataSetId]);

  const neighborToAssociationEKIDs :Map<UUID, UUID> = useMemo(() => (
    Map().withMutations((mutableMap) => {
      neighbors
        .slice(neighborsIndex, neighborsIndex + MAX_HITS_10)
        .forEach((neighbor :Map) => mutableMap.set(get(neighbor, 'neighborId'), get(neighbor, 'associationId')));
    })
  ), [neighbors, neighborsIndex]);

  const totalNeighbors :number = useMemo(() => (
    neighbors ? neighbors.count() : 0
  ), [neighbors]);

  const associationColumns :Map<UUID, Map> = useSelector(selectOrgDataSetColumns(organizationId, associationDataSetId));
  const neighborColumns :Map<UUID, Map> = useSelector(selectOrgDataSetColumns(organizationId, neighborDataSetId));

  // OPTIMIZE: no need to compute this on every render
  const tableHeaders = [];
  associationColumns.forEach((column :Map) => {
    tableHeaders.push({
      key: `${column.get(NAME)}_edge`,
      label: `${column.getIn([METADATA, TITLE])} (Edge)`,
      sortable: false,
      cellStyle: { 'background-color': PURPLE.P00 }
    });
  });
  neighborColumns.forEach((column :Map) => {
    tableHeaders.push({
      key: column.get(NAME),
      label: column.getIn([METADATA, TITLE]),
      sortable: false,
    });
  });

  // OPTIMIZE: no need to compute this on every render
  const associationData :Map = useSelector(
    selectOrgEntitySetData(associationDataSetId, neighborToAssociationEKIDs.valueSeq())
  );
  const neighborData :Map = useSelector(
    selectOrgEntitySetData(neighborDataSetId, neighborToAssociationEKIDs.keySeq())
  );

  useEffect(() => {
    if (isSuccess(fetchEntitySetDataRS)) {
      const newTableData = neighborToAssociationEKIDs.entrySeq()
        .map(([neighborEntityKeyId :UUID, associationEntityKeyId :UUID], index :number) => {
          // 'id' is used as the "key" prop in the table component, so it needs to be unique
          let entityData = neighborData.get(neighborEntityKeyId).set('id', `${neighborEntityKeyId}-${index}`);
          associationData.get(associationEntityKeyId).forEach((value, key) => {
            entityData = entityData.set(`${key}_edge`, value);
          });
          return entityData;
        }).toJS(); // TODO: avoid .toJS()
      setTableData(newTableData);
    }
  // NOTE: leaving out "dataSetData" from depedency array because it tends to cause infinite renders
  // TODO: figure out how to avoid the infinite renders when "dataSetData" is passed
  }, [neighborToAssociationEKIDs, fetchEntitySetDataRS]);

  useEffect(() => {
    dispatch(
      fetchEntitySetData({
        entitySetId: associationDataSetId,
        entityKeyIds: neighborToAssociationEKIDs.valueSeq().toSet(),
      })
    );
    dispatch(
      fetchEntitySetData({
        entitySetId: neighborDataSetId,
        entityKeyIds: neighborToAssociationEKIDs.keySeq().toSet(),
      })
    );
  }, [dispatch, neighborToAssociationEKIDs, neighborDataSetId]);

  const handleOnPageChange = ({ page, start }) => {
    setTablePage(page);
    setNeighborsIndex(start);
    dispatch(resetRequestStates([FETCH_ENTITY_SET_DATA, neighborDataSetId]));
  };

  const components = {
    Row: ({ data, headers } :Object) => (
      <EntityDataRow
          data={data}
          dataSetId={neighborDataSetId}
          headers={headers}
          isModal={isModal}
          organizationId={organizationId} />
    )
  };

  return (
    <>
      <DataTableWrapper>
        <Table
            components={components}
            data={tableData}
            headers={tableHeaders}
            isLoading={isPending(fetchEntitySetDataRS)} />
      </DataTableWrapper>
      <PaginationToolbar
          page={tablePage}
          count={totalNeighbors}
          onPageChange={handleOnPageChange}
          rowsPerPage={MAX_HITS_10} />
    </>
  );
};

export default EntityNeighborsTable;
