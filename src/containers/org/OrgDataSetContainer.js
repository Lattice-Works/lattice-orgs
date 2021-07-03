/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  AppContentWrapper,
  AppNavigationWrapper,
  Badge,
  Colors,
  Label,
  MarkdownPreview,
  Typography,
} from 'lattice-ui-kit';
import { LangUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import type { Organization, UUID } from 'lattice';

import {
  CONTACTS,
  DESCRIPTION,
  METADATA,
  NAME,
  TITLE,
} from '~/common/constants';
import { isEntitySet } from '~/common/utils';
import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  NavContentWrapper,
  SpaceBetweenGrid,
  StackGrid,
} from '~/components';
import {
  selectDataSetSchema,
  selectOrgDataSet,
  selectOrgDataSetColumns,
  selectOrgDataSetSize,
  selectOrganization
} from '~/core/redux/selectors';
import { Routes } from '~/core/router';

import DataSetActionButton from './components/dataset/DataSetActionButton';
import DataSetDataContainer from './DataSetDataContainer';
import DataSetMetadataContainer from './DataSetMetadataContainer';

const { BLUE } = Colors;
const { isDefined, isNonEmptyString } = LangUtils;

const ReducedMargin = styled.div`
  margin: -16px 0;
`;

const CountBadge = styled(Badge)`
  background: ${BLUE.B300};
  color: white;
  margin-right: 5px;
`;

const OrgDataSetContainer = ({
  dataSetDataRoute,
  dataSetId,
  dataSetRoute,
  organizationId,
  organizationRoute,
} :{|
  dataSetDataRoute :string;
  dataSetId :UUID;
  dataSetRoute :string;
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const dataSet :Map = useSelector(selectOrgDataSet(organizationId, dataSetId));
  const dataSetColumns :Map<UUID, Map> = useSelector(selectOrgDataSetColumns(organizationId, dataSetId));
  const dataSetSchema :?string = useSelector(selectDataSetSchema(dataSetId));
  const dataSetSize :?number = useSelector(selectOrgDataSetSize(organizationId, dataSetId));

  const contacts :List<string> = dataSet.getIn([METADATA, CONTACTS]);
  const description :string = dataSet.getIn([METADATA, DESCRIPTION]);
  const name :string = dataSet.get(NAME);
  const title :string = dataSet.getIn([METADATA, TITLE]);

  const hasContactInfo :boolean = contacts.some(isNonEmptyString);

  if (organization) {

    const renderDataSetDataContainer = () => (
      <DataSetDataContainer dataSetId={dataSetId} dataSetName={title || name} organizationId={organizationId} />
    );

    const renderDataSetMetaContainer = () => (
      <DataSetMetadataContainer dataSetId={dataSetId} organizationId={organizationId} />
    );

    return (
      <>
        <AppContentWrapper>
          <Crumbs>
            <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
            <CrumbItem>{title || name}</CrumbItem>
          </Crumbs>
          <StackGrid gap={32}>
            <StackGrid>
              <SpaceBetweenGrid>
                <div>
                  <Typography variant="h1">{title || name}</Typography>
                  <Typography variant="subtitle1">{name}</Typography>
                </div>
                <DataSetActionButton dataSetId={dataSetId} organizationId={organizationId} />
              </SpaceBetweenGrid>
              <div>
                <CountBadge count={dataSetColumns.size} />
                <Label subtle>Data Fields</Label>
                {
                  isDefined(dataSetSize) && isEntitySet(dataSet) && (
                    <>
                      <CountBadge count={dataSetSize} max={1000000} />
                      <Label subtle>Records</Label>
                    </>
                  )
                }
              </div>
            </StackGrid>
            {
              isNonEmptyString(description) && (
                <ReducedMargin>
                  <MarkdownPreview>{description}</MarkdownPreview>
                </ReducedMargin>
              )
            }
            {
              isNonEmptyString(dataSetSchema) && (
                <StackGrid>
                  <Typography variant="h4">Schema</Typography>
                  <Typography>{dataSetSchema}</Typography>
                </StackGrid>
              )
            }
            <StackGrid>
              <Typography variant="h4">Contact</Typography>
              {
                contacts.map((contact :string) => {
                  if (isNonEmptyString(contact)) {
                    return (
                      <Typography key={contact}>{contact}</Typography>
                    );
                  }
                  return null;
                })
              }
              {
                !hasContactInfo && (
                  <Typography>No contact information is available.</Typography>
                )
              }
            </StackGrid>
          </StackGrid>
        </AppContentWrapper>
        <NavContentWrapper borderless bgColor="white">
          <AppNavigationWrapper borderless>
            <NavLink exact strict to={dataSetRoute}>
              <Typography variant="h3">Properties</Typography>
            </NavLink>
            {
              isEntitySet(dataSet) && (
                <NavLink to={dataSetDataRoute}>
                  <Typography variant="h3">Search</Typography>
                </NavLink>
              )
            }
          </AppNavigationWrapper>
        </NavContentWrapper>
        <Switch>
          <Route exact path={Routes.ORG_DATA_SET_DATA} render={renderDataSetDataContainer} />
          <Route exact path={Routes.ORG_DATA_SET} render={renderDataSetMetaContainer} />
        </Switch>
      </>
    );
  }

  return null;
};

export default OrgDataSetContainer;
