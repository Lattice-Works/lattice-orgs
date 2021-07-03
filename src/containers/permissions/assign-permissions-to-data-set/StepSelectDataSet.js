/*
 * @flow
 */

import React, { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  CardSegment,
  PaginationToolbar,
  Radio,
  Typography,
} from 'lattice-ui-kit';
import { DataUtils, LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { FQNS, MAX_HITS_10, SEARCH } from '~/common/constants';
import {
  DataSetTitle,
  SearchForm,
  SpaceBetweenGrid,
  StackGrid,
} from '~/components';
import {
  selectSearchHits,
  selectSearchPage,
  selectSearchQuery,
  selectSearchTotalHits,
} from '~/core/redux/selectors';
import {
  SEARCH_ORGANIZATION_DATA_SETS,
  searchOrganizationDataSets,
} from '~/core/search/actions';

const { getPropertyValue } = DataUtils;
const { isNonEmptyString } = LangUtils;

const PaginationWrapper = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr auto;
`;

const StepSelectDataSet = ({
  organizationId,
  setTargetDataSetId,
  setTargetDataSetTitle,
  targetDataSetId,
} :{
  organizationId :UUID;
  setTargetDataSetId :(id :UUID) => void;
  setTargetDataSetTitle :(title :string) => void;
  targetDataSetId :UUID;
}) => {

  const dispatch = useDispatch();
  const [searchId, setSearchId] = useState();

  const searchOrgDataSetsRS :?RequestState = useRequestState([SEARCH, SEARCH_ORGANIZATION_DATA_SETS]);

  const searchHits :Map = useSelector(selectSearchHits(SEARCH_ORGANIZATION_DATA_SETS));
  const searchPage :number = useSelector(selectSearchPage(SEARCH_ORGANIZATION_DATA_SETS));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_ORGANIZATION_DATA_SETS)) || '*';
  const searchTotalHits :number = useSelector(selectSearchTotalHits(SEARCH_ORGANIZATION_DATA_SETS));

  const dispatchDataSetSearch = useCallback((params :{ page ?:number, query ?:string, start ?:number } = {}) => {
    const { page = 0, query = searchQuery, start = 0 } = params;
    if (isNonEmptyString(query)) {
      const action = searchOrganizationDataSets({
        maxHits: MAX_HITS_10,
        organizationId,
        page,
        query,
        start,
      });
      dispatch(action);
      setSearchId(action.id);
    }
  }, [dispatch, organizationId, searchQuery]);

  useEffect(() => {
    if (!searchId) {
      dispatchDataSetSearch({ query: '*' });
    }
  }, [dispatchDataSetSearch, searchId]);

  const handleOnChangeSelectDataSet = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const id = event.currentTarget.dataset.id;
    const title = event.currentTarget.dataset.title;
    setTargetDataSetId(id);
    setTargetDataSetTitle(title);
  };

  return (
    <StackGrid>
      <Typography>Search for a data set to assign permissions.</Typography>
      <SearchForm
          onSubmit={(query :string) => dispatchDataSetSearch({ query })}
          searchQuery={searchQuery}
          searchRequestState={searchOrgDataSetsRS} />
      <div>
        {
          searchHits.map((hit :Map) => {
            const id = getPropertyValue(hit, [FQNS.OL_ID, 0]);
            const name :string = getPropertyValue(hit, [FQNS.OL_DATA_SET_NAME, 0]);
            const title :string = getPropertyValue(hit, [FQNS.OL_TITLE, 0]);
            return (
              <CardSegment key={id} padding="8px 0">
                <SpaceBetweenGrid>
                  <div>
                    <DataSetTitle dataSet={hit} />
                    <Typography variant="caption">{id}</Typography>
                  </div>
                  <Radio
                      checked={targetDataSetId === id}
                      data-id={id}
                      data-title={title || name}
                      name="select-data-set"
                      onChange={handleOnChangeSelectDataSet} />
                </SpaceBetweenGrid>
              </CardSegment>
            );
          })
        }
      </div>
      {
        searchTotalHits > MAX_HITS_10 && (
          <PaginationWrapper>
            <PaginationToolbar
                count={searchTotalHits}
                onPageChange={({ page, start }) => dispatchDataSetSearch({ page, start })}
                page={searchPage}
                rowsPerPage={MAX_HITS_10} />
          </PaginationWrapper>
        )
      }
    </StackGrid>
  );
};

export default StepSelectDataSet;
