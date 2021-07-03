/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { Card, CardSegment, Typography } from 'lattice-ui-kit';
import {
  LangUtils,
  ValidationUtils,
  useGoToRoute,
} from 'lattice-utils';
import type { UUID } from 'lattice';

import {
  DESCRIPTION,
  ID,
  METADATA,
  NAME,
} from '~/common/constants';
import { DataSetTitle, StackGrid } from '~/components';
import { Routes } from '~/core/router';

const { isNonEmptyString } = LangUtils;
const { isValidUUID } = ValidationUtils;

const DataSetSearchResultCard = ({
  organizationId,
  dataSet,
} :{|
  organizationId :UUID;
  dataSet :Map;
|}) => {

  const dataSetId :UUID = dataSet.get(ID);
  const goToOrganizationDataSet = useGoToRoute(
    Routes.ORG_DATA_SET
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.DATA_SET_ID_PARAM, dataSetId)
  );

  if (!isValidUUID(dataSetId)) {
    return null;
  }

  const description :string = dataSet.getIn([METADATA, DESCRIPTION]);
  const name :string = dataSet.get(NAME);

  return (
    <Card id={dataSetId} onClick={goToOrganizationDataSet}>
      <CardSegment>
        <StackGrid gap={8}>
          <DataSetTitle component="h2" dataSet={dataSet} variant="h4" />
          <Typography variant="subtitle1">{name}</Typography>
          {
            isNonEmptyString(description) && (
              <Typography variant="body1">{description}</Typography>
            )
          }
        </StackGrid>
      </CardSegment>
    </Card>
  );
};

export default DataSetSearchResultCard;
