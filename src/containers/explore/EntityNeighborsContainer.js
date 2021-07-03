/*
 * @flow
 */

import React, { Fragment, useMemo, useState } from 'react';

import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { Checkbox, Typography } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { EXPLORE } from '~/common/constants';
import {
  CrumbSeparator,
  DataSetTitle,
  Spinner,
  StackGrid,
} from '~/components';
import { selectOrgDataSets } from '~/core/redux/selectors';

import EntityNeighborsTable from './EntityNeighborsTable';
import { EXPLORE_ENTITY_NEIGHBORS } from './actions';

const { isPending } = ReduxUtils;

// TODO: fix GapGrid so it can wrap lines (and also that extra 1fr thing)
const FlexWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;

  svg {
    margin-right: 5px;
  }
`;

const EntityNeighborsContainer = ({
  isModal,
  neighbors,
  organizationId,
} :{|
  isModal :boolean;
  neighbors :Map;
  organizationId :UUID;
|}) => {

  const [selectedAssociationDataSetIds, setSelectedAssociationDataSetIds] = useState(Set());
  const [selectedNeighborDataSetIds, setSelectedNeighborDataSetIds] = useState(Set());

  const exploreEntityNeighborsRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ENTITY_NEIGHBORS]);

  const associationDataSetIds :Set<UUID> = useMemo(() => (
    neighbors.keySeq().toSet()
  ), [neighbors]);

  const neighborDataSetIds :Set<UUID> = useMemo(() => (
    Set().withMutations((mutableSet :Set<UUID>) => {
      neighbors.forEach((associationNeighbors :Map) => mutableSet.add(associationNeighbors.keySeq()));
    }).flatten()
  ), [neighbors]);

  const dataSetIds :Set<UUID> = useMemo(() => (
    Set().union(associationDataSetIds).union(neighborDataSetIds)
  ), [associationDataSetIds, neighborDataSetIds]);

  const dataSets :Map<UUID, Map> = useSelector(selectOrgDataSets(organizationId, dataSetIds));

  const toggleSelectedAssociation = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const dataSetId :UUID = event.currentTarget.value;
    if (selectedAssociationDataSetIds.has(dataSetId)) {
      setSelectedAssociationDataSetIds(selectedAssociationDataSetIds.delete(dataSetId));
    }
    else {
      setSelectedAssociationDataSetIds(selectedAssociationDataSetIds.add(dataSetId));
    }
  };

  const toggleSelectedNeighbor = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const dataSetId :UUID = event.currentTarget.value;
    if (selectedNeighborDataSetIds.has(dataSetId)) {
      setSelectedNeighborDataSetIds(selectedNeighborDataSetIds.delete(dataSetId));
    }
    else {
      setSelectedNeighborDataSetIds(selectedNeighborDataSetIds.add(dataSetId));
    }
  };

  const associationChips = associationDataSetIds.map((associationDataSetId :UUID) => {
    const associationDataSet :Map = dataSets.get(associationDataSetId);
    return (
      <Checkbox
          checked={selectedAssociationDataSetIds.has(associationDataSetId)}
          key={associationDataSetId}
          label={associationDataSet.getIn(['metadata', 'title'])}
          mode="chip"
          onChange={toggleSelectedAssociation}
          value={associationDataSetId} />
    );
  });

  const neighborChips = selectedAssociationDataSetIds.map((associationDataSetId :UUID) => (
    neighbors.get(associationDataSetId, Map()).keySeq().map((neighborDataSetId :UUID) => {
      const neighborDataSet :Map = dataSets.get(neighborDataSetId);
      return (
        <Checkbox
            checked={selectedNeighborDataSetIds.has(neighborDataSetId)}
            key={neighborDataSetId}
            label={neighborDataSet.getIn(['metadata', 'title'])}
            mode="chip"
            onChange={toggleSelectedNeighbor}
            value={neighborDataSetId} />
      );
    })
  )).flatten();

  const neighborTables = selectedAssociationDataSetIds.map((associationDataSetId :UUID) => (
    selectedNeighborDataSetIds.map((neighborDataSetId :UUID) => {
      const associationDataSet :Map = dataSets.get(associationDataSetId);
      const neighborDataSet :Map = dataSets.get(neighborDataSetId);
      return neighbors.hasIn([associationDataSetId, neighborDataSetId]) && (
        <Fragment key={neighborDataSetId}>
          <br />
          <FlexWrapper>
            <DataSetTitle dataSet={associationDataSet} />
            <CrumbSeparator />
            <DataSetTitle dataSet={neighborDataSet} />
          </FlexWrapper>
          <EntityNeighborsTable
              associationDataSet={associationDataSet}
              key={neighborDataSetId}
              neighborDataSet={neighborDataSet}
              isModal={isModal}
              neighbors={neighbors.getIn([associationDataSetId, neighborDataSetId]) || List()}
              organizationId={organizationId} />
        </Fragment>
      );
    })
  )).flatten();

  if (isPending(exploreEntityNeighborsRS)) {
    return (
      <Spinner />
    );
  }

  if (associationDataSetIds.isEmpty()) {
    return (
      <Typography variant="subtitle1">The selected entity has no neighbors.</Typography>
    );
  }

  return (
    <StackGrid>
      <Typography variant="subtitle1">Association Entity Sets:</Typography>
      <div>{associationChips}</div>
      {
        !selectedAssociationDataSetIds.isEmpty() && (
          <>
            <Typography variant="subtitle1">Destination Entity Sets:</Typography>
            <div>{neighborChips}</div>
            {neighborTables}
          </>
        )
      }
    </StackGrid>
  );
};

export default EntityNeighborsContainer;
