/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import {
  List,
  Map,
  Set,
  set,
} from 'immutable';
import {
  AppContentWrapper,
  PaginationToolbar,
  Table,
  Typography,
} from 'lattice-ui-kit';
import {
  DataUtils,
  LangUtils,
  ValidationUtils,
  useRequestState
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import EntityDataModal from '~/containers/explore/components/EntityDataModal';
import {
  MAX_HITS_10,
  METADATA,
  NAME,
  SEARCH,
  TITLE,
} from '~/common/constants';
import {
  DataTableWrapper,
  SearchForm,
  Spinner,
  StackGrid,
  ValueCell,
} from '~/components';
import {
  selectOrgDataSetColumns,
  selectSearchHits,
  selectSearchPage,
  selectSearchQuery,
  selectSearchTotalHits,
} from '~/core/redux/selectors';
import { SEARCH_DATA, clearSearchState, searchData } from '~/core/search/actions';

const { getEntityKeyId } = DataUtils;
const { isNonEmptyString } = LangUtils;
const { isValidUUID } = ValidationUtils;

const DataSetDataContainer = ({
  dataSetId,
  dataSetName,
  organizationId,
} :{|
  dataSetId :UUID;
  dataSetName :string;
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();
  const [tableData, setTableData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [selectedEntityKeyId, setSelectedEntityKeyId] = useState('');

  const searchDataSetDataRS :?RequestState = useRequestState([SEARCH, SEARCH_DATA]);

  const dataSetColumns :Map<UUID, Map> = useSelector(selectOrgDataSetColumns(organizationId, dataSetId));
  const searchHits :List = useSelector(selectSearchHits(SEARCH_DATA));
  const searchPage :number = useSelector(selectSearchPage(SEARCH_DATA));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_DATA));
  const searchTotalHits :number = useSelector(selectSearchTotalHits(SEARCH_DATA));

  useEffect(() => {
    const data :List = searchHits.map((entity :Map) => set(entity, 'id', getEntityKeyId(entity)));
    const headersSet :Set<string> = Set().withMutations((mutableSet :Set) => {
      searchHits.forEach((entity :Map) => mutableSet.union(entity.keySeq()));
    });
    const headers :List = dataSetColumns
      .valueSeq()
      .filter((column :Map) => headersSet.has(column.get(NAME)))
      .map((column :Map) => {
        const fqn :string = column.get(NAME);
        const title :string = column.getIn([METADATA, TITLE]);
        return { key: fqn, label: `${title} (${fqn})`, sortable: false };
      });
    setTableData(data.toJS());
    setTableHeaders(headers.toJS());
  }, [dataSetColumns, searchHits]);

  useEffect(() => () => {
    dispatch(clearSearchState(SEARCH_DATA));
  }, [dispatch]);

  const dispatchSearch = (params :{ page ?:number, query ?:string, start ?:number } = {}) => {
    const { page = 1, query = searchQuery, start = 0 } = params;
    if (isNonEmptyString(query)) {
      dispatch(
        searchData({
          page,
          query,
          start,
          entitySetId: dataSetId,
          maxHits: MAX_HITS_10,
        })
      );
    }
    else {
      dispatch(clearSearchState(SEARCH_DATA));
    }
  };

  const components = useMemo(() => ({
    Row: ({ data, components: { Cell }, headers } :Object) => (
      <tr onClick={() => setSelectedEntityKeyId(data.id)}>
        {
          headers.map((header) => (
            <ValueCell
                component={Cell}
                key={`${data.id}_cell_${header.key}`}
                value={data[header.key]} />
          ))
        }
      </tr>
    )
  }), []);

  return (
    <AppContentWrapper>
      <StackGrid gap={16}>
        <SearchForm
            onSubmit={(query :string) => dispatchSearch({ query })}
            searchRequestState={searchDataSetDataRS} />
        {
          <PaginationToolbar
              count={searchTotalHits}
              onPageChange={({ page, start }) => dispatchSearch({ page, start })}
              page={searchPage}
              rowsPerPage={MAX_HITS_10} />
        }
        {
          searchDataSetDataRS === RequestStates.PENDING && (
            <Spinner />
          )
        }
        {
          searchDataSetDataRS === RequestStates.SUCCESS && searchHits.count() === 0 && (
            <Typography>No search results.</Typography>
          )
        }
        {
          searchDataSetDataRS === RequestStates.SUCCESS && searchHits.count() > 0 && (
            <DataTableWrapper>
              <Table components={components} data={tableData} headers={tableHeaders} />
            </DataTableWrapper>
          )
        }
      </StackGrid>
      <EntityDataModal
          dataSetId={dataSetId}
          dataSetName={dataSetName}
          entityKeyId={selectedEntityKeyId}
          isVisible={isValidUUID(dataSetId) && isValidUUID(selectedEntityKeyId)}
          onClose={() => setSelectedEntityKeyId('')}
          organizationId={organizationId} />
    </AppContentWrapper>
  );
};

export default DataSetDataContainer;
