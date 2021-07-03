/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import {
  List,
  Map,
  Set,
  fromJS,
  get,
} from 'immutable';
import { Form } from 'lattice-fabricate';
import {
  AppContentWrapper,
  Button,
  Input,
  Modal,
  Typography,
} from 'lattice-ui-kit';
import { useError, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ORGANIZATIONS } from '~/common/constants';
import { clipboardWriteText } from '~/common/utils';
import {
  ActionsGrid,
  CopyButton,
  CrumbItem,
  CrumbLink,
  Crumbs,
  EditButton,
  Pre,
  Spinner,
  StackGrid,
} from '~/components';
import { resetRequestStates } from '~/core/redux/actions';
import {
  selectMyKeys,
  selectOrganization,
  selectOrganizationIntegrationDetails,
} from '~/core/redux/selectors';
import type { SagaError } from '~/common/types';

import { GET_ORGANIZATION_INTEGRATION_DETAILS, getOrganizationIntegrationDetails } from '../actions';
import { RenameOrgDatabaseModal } from '../components';
import { DBMS_TYPES } from '../constants';
import { generateIntegrationConfig } from '../utils';

const dataSchema = {
  properties: {
    fields: {
      properties: {
        targetServer: {
          title: 'Target Server',
          type: 'string',
        },
        targetDatabase: {
          title: 'Target Database',
          type: 'string',
        },
        targetDBMS: {
          enum: Object.keys(DBMS_TYPES),
          title: 'Target DBMS',
          type: 'string',
        },
        targetPort: {
          title: 'Target Port',
          type: 'number',
        },
      },
      title: '',
      type: 'object',
    },
  },
  title: '',
  type: 'object',
};

const uiSchema = {
  fields: {
    classNames: 'column-span-12',
  }
};

const INITIAL_FORM_DATA = fromJS({
  fields: {
    targetDBMS: '',
    targetDatabase: '',
    targetPort: 5432,
    targetServer: '',
  }
});

const GenerateIntegrationConfigButton = styled(Button)`
  width: fit-content;
`;

type FormData = {
  fields :{
    targetDBMS :?string;
    targetDatabase :?string;
    targetPort :?number;
    targetServer :?string;
  };
};

const OrgSettingsContainer = ({
  organizationId,
  organizationRoute,
} :{|
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const dispatch = useDispatch();

  const [integrationConfigFormData, setIntegrationConfigFormData] = useState(INITIAL_FORM_DATA);
  const [isVisibleGenerateConfigModal, setIsVisibleGenerateConfigModal] = useState(false);
  const [isVisibleRenameModal, setIsVisibleRenameModal] = useState(false);

  const getIntegrationDetailsRS :?RequestState = useRequestState([ORGANIZATIONS, GET_ORGANIZATION_INTEGRATION_DETAILS]);
  const getIntegrationDetailsError :?SagaError = useError([ORGANIZATIONS, GET_ORGANIZATION_INTEGRATION_DETAILS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());
  const isOwner :boolean = myKeys.has(List([organizationId]));
  const integrationDetails :Map = useSelector(selectOrganizationIntegrationDetails(organizationId));

  const databaseName :string = get(integrationDetails, 'databaseName', '');
  const databaseCredential :string = get(integrationDetails, 'credential', '');
  const databaseUserName :string = get(integrationDetails, 'userName', '');

  const jdbcURL = useMemo(() => (
    `jdbc:postgresql://atlas.openlattice.com:30001/org_${organizationId.replace(/-/g, '')}`
  ), [organizationId]);

  const isUnauthorized :boolean = getIntegrationDetailsError?.status === 401;

  useEffect(() => {
    dispatch(getOrganizationIntegrationDetails(organizationId));
    return () => {
      dispatch(resetRequestStates([GET_ORGANIZATION_INTEGRATION_DETAILS]));
    };
  }, [dispatch, organizationId]);

  const handleOnClickGenerateIntegrationConfig = () => {

    if (organization) {
      generateIntegrationConfig({
        orgId: organizationId,
        orgName: organization.title,
        orgPassword: databaseCredential,
        orgUsername: databaseUserName,
        targetDatabase: integrationConfigFormData.getIn(['fields', 'targetDatabase']),
        targetPort: integrationConfigFormData.getIn(['fields', 'targetPort']),
        targetServer: integrationConfigFormData.getIn(['fields', 'targetServer']),
        targetDBMS: integrationConfigFormData.getIn(['fields', 'targetDBMS']),
      });
    }
  };

  const closeGenerateConfigModal = () => {
    setIntegrationConfigFormData(INITIAL_FORM_DATA);
    setIsVisibleGenerateConfigModal(false);
  };

  const openGenerateConfigModal = () => {
    setIsVisibleGenerateConfigModal(true);
  };

  const handleOnChangeIntegrationConfigForm = ({ formData } :{ formData :FormData }) => {
    let newFormData = fromJS(formData);
    const targetDBMS :?string = newFormData.getIn(['fields', 'targetDBMS']);
    if (targetDBMS && DBMS_TYPES[targetDBMS]) {
      const dbms = DBMS_TYPES[targetDBMS];
      newFormData = newFormData.setIn(['fields', 'targetPort'], dbms.port);
    }
    setIntegrationConfigFormData(newFormData);
  };

  if (getIntegrationDetailsRS === RequestStates.PENDING || getIntegrationDetailsRS === RequestStates.STANDBY) {
    return (
      <AppContentWrapper>
        <Spinner />
      </AppContentWrapper>
    );
  }

  return (
    <AppContentWrapper>
      <Crumbs>
        <CrumbLink to={organizationRoute}>{organization?.title || 'Organization'}</CrumbLink>
        <CrumbItem>Database</CrumbItem>
      </Crumbs>
      <StackGrid>
        <Typography variant="h1">Database Details</Typography>
        <div>
          <Typography component="h2" variant="body2">ORGANIZATION ID</Typography>
          <ActionsGrid align={{ v: 'center' }} fit>
            <Pre>{organizationId}</Pre>
            <CopyButton
                aria-label="copy organization id"
                onClick={() => clipboardWriteText(organizationId)} />
          </ActionsGrid>
        </div>
        <div>
          <Typography component="h2" variant="body2">DATABASE NAME</Typography>
          <ActionsGrid align={{ v: 'center' }} fit>
            <Pre>{databaseName}</Pre>
            <CopyButton
                aria-label="copy database name"
                onClick={() => clipboardWriteText(databaseName)} />
            {
              isOwner && (
                <EditButton
                    aria-label="edit database name"
                    color="default"
                    onClick={() => setIsVisibleRenameModal(true)} />
              )
            }
          </ActionsGrid>
        </div>
        {
          isUnauthorized
            ? (
              <Typography color="error" variant="overline">
                You are not authorized to view database credetials.
              </Typography>
            )
            : (
              <div>
                <Typography component="h2" variant="body2">JDBC URL</Typography>
                <ActionsGrid align={{ v: 'center' }} fit>
                  <Pre>{jdbcURL}</Pre>
                  <CopyButton
                      aria-label="copy jdbc url"
                      onClick={() => clipboardWriteText(jdbcURL)} />
                </ActionsGrid>
              </div>
            )
        }
        {
          isOwner && getIntegrationDetailsRS === RequestStates.SUCCESS && (
            <>
              <div>
                <Typography component="h2" variant="body2">DATABASE USERNAME</Typography>
                <ActionsGrid align={{ v: 'center' }} fit>
                  <Pre>{databaseUserName}</Pre>
                  <CopyButton
                      aria-label="copy database username"
                      onClick={() => clipboardWriteText(databaseUserName)} />
                </ActionsGrid>
              </div>
              <StackGrid gap={4}>
                <Typography component="h2" variant="body2">DATABASE CREDENTIAL</Typography>
                <ActionsGrid fit>
                  <Input disabled type="password" value="********************************" />
                  <CopyButton
                      aria-label="copy database credential"
                      onClick={() => clipboardWriteText(databaseCredential)} />
                </ActionsGrid>
              </StackGrid>
              <GenerateIntegrationConfigButton onClick={openGenerateConfigModal}>
                Generate Integration Config
              </GenerateIntegrationConfigButton>
              <Modal
                  isVisible={isVisibleGenerateConfigModal}
                  onClickPrimary={handleOnClickGenerateIntegrationConfig}
                  onClose={closeGenerateConfigModal}
                  textPrimary="Generate"
                  textTitle="Generate Integration Configuration File"
                  viewportScrolling>
                <Form
                    formData={integrationConfigFormData.toJS()}
                    hideSubmit
                    noPadding
                    onChange={handleOnChangeIntegrationConfigForm}
                    schema={dataSchema}
                    uiSchema={uiSchema} />
              </Modal>
            </>
          )
        }
        {
          isOwner && (
            <RenameOrgDatabaseModal
                isVisible={isVisibleRenameModal}
                onClose={() => setIsVisibleRenameModal(false)}
                organizationId={organizationId} />
          )
        }
      </StackGrid>
    </AppContentWrapper>
  );
};

export default OrgSettingsContainer;
