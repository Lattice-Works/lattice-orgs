/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { faMinus, faPlus } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  Card,
  CardSegment,
  Colors,
  Input,
  SearchInput,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as ReduxActions from '../../core/redux/ReduxActions';
import * as Routes from '../../core/router/Routes';
import * as RoutingActions from '../../core/router/RoutingActions';
import { AddButton, RemoveButton } from '../../components/buttons';
import { isValidUUID } from '../../utils/ValidationUtils';
import type { GoToRoot } from '../../core/router/RoutingActions';

const { NEUTRALS } = Colors;
const { GET_ORGANIZATION } = OrganizationsApiActions;

const OrgTitle = styled.h1`
  font-size: 28px;
  font-weight: normal;
  margin: 20px 0 0 0;
  padding: 0;
`;

const OrgDescription = styled.h3`
  font-size: 20px;
  font-weight: normal;
  margin: 0;
  padding: 0;
`;

const Tabs = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: 30px 0 50px 0;
`;

const AddInputAddButtonRow = styled.div`
  display: grid;
  grid-gap: 5px;
  grid-template-columns: 1fr auto;

  > button {
    margin-right: 4px;
  }
`;

const CompactCardSegment = styled(CardSegment)`
  align-items: center;
  justify-content: space-between;
  padding: 3px 3px 3px 10px;
`;

const OrgDetailsCardSegment = styled(CardSegment)`
  > div {
    display: grid;
    grid-gap: 30px;
    grid-template-columns: 1fr 1fr;
  }

  > hr {
    background-color: ${NEUTRALS[4]};
    border: none;
    height: 1px;
    margin: 48px 0;
  }
`;

const SectionGrid = styled.section`
  display: grid;
  grid-auto-rows: min-content;

  > h1, h2 {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
  }

  > h3, h4 {
    color: ${NEUTRALS[1]};
    font-size: 16px;
    font-weight: normal;
    margin: 16px 0 0 0;
  }

  > div {
    margin: 32px 0 0 0;
  }

  i {
    color: ${NEUTRALS[1]};
    font-size: 16px;
    font-weight: normal;
    margin: 24px 0 0 0;
  }
`;

const ORG_NAV_LINK_ACTIVE :string = 'org-nav-link-active';

const OrgNavLink = styled(NavLink).attrs({
  activeClassName: ORG_NAV_LINK_ACTIVE
})`
  align-items: center;
  border-bottom: 2px solid transparent;
  color: ${NEUTRALS[1]};
  font-size: 18px;
  font-weight: 600;
  line-height: 70px;
  margin-right: 40px;
  outline: none;
  text-decoration: none;

  &:focus {
    text-decoration: none;
  }

  &:hover {
    color: ${NEUTRALS[0]};
    cursor: pointer;
    outline: none;
    text-decoration: none;
  }

  &.${ORG_NAV_LINK_ACTIVE} {
    border-bottom: 2px solid #674fef;
    color: #674fef;
  }
`;

const DOMAINS_SUB_TITLE = `
Users from these domains will automatically be approved when requesting to join this organization.
`;

const TRUSTED_ORGS_SUB_TITLE = `
Organizations listed here and all their members will be able to see this organization and all its roles.
`;

const ROLES_SUB_TITLE = `
You will be able to use the Roles below to manage permissions on Entity Sets that you own.
`;

const MEMBERS_SUB_TITLE = `
Click on a member to view their roles. To add members to this organization, search for users in the system.
`;

type Props = {
  actions :{
    getOrganization :RequestSequence;
    goToRoot :GoToRoot;
    resetRequestState :(actionType :string) => void;
  };
  org :Map;
  orgId :UUID;
  requestStates :{
    [typeof GET_ORGANIZATION] :RequestState;
  };
};

class OrgContainer extends Component<Props> {

  componentDidMount() {

    const { actions, org, orgId } = this.props;

    if (!isValidUUID(orgId)) {
      actions.goToRoot();
    }
    else if (org.isEmpty()) {
      actions.getOrganization(orgId);
    }
  }

  componentDidUpdate(prevProps :Props) {

    const { actions, orgId, requestStates } = this.props;

    if (!isValidUUID(orgId)) {
      actions.goToRoot();
    }
    else {
      if (orgId !== prevProps.orgId) {
        actions.getOrganization(orgId);
      }
      if (requestStates[GET_ORGANIZATION] === RequestStates.SUCCESS
          && prevProps.requestStates[GET_ORGANIZATION] === RequestStates.PENDING) {
        actions.resetRequestState(GET_ORGANIZATION);
      }
      else if (requestStates[GET_ORGANIZATION] === RequestStates.FAILURE
          && prevProps.requestStates[GET_ORGANIZATION] === RequestStates.PENDING) {
        actions.goToRoot();
      }
    }
  }

  componentWillUnmount() {

    const { actions } = this.props;
    actions.resetRequestState(GET_ORGANIZATION);
  }

  renderAddButton = (onClick :Function) => (
    <AddButton onClick={onClick}>
      <FontAwesomeIcon icon={faPlus} />
    </AddButton>
  )

  renderRemoveButton = (onClick :Function) => (
    <RemoveButton onClick={onClick}>
      <FontAwesomeIcon icon={faMinus} />
    </RemoveButton>
  )

  renderOrgDetails = () => {

    const { org } = this.props;

    return (
      <Card>
        <OrgDetailsCardSegment vertical>
          <OrgDescription>{org.get('description')}</OrgDescription>
          <hr />
          <div>
            {this.renderDomainsSection()}
            <SectionGrid>
              <h2>Trusted Organizations</h2>
              <h4>{TRUSTED_ORGS_SUB_TITLE}</h4>
              <i>No trusted organizations</i>
            </SectionGrid>
          </div>
          <hr />
          <div>
            {this.renderRolesSection()}
            {this.renderMembersSection()}
          </div>
        </OrgDetailsCardSegment>
      </Card>
    );
  }

  renderDomainsSection = () => {

    const { org } = this.props;
    const emails = org.get('emails', List());

    const emailCardSegments = emails.map((email :string) => (
      <CompactCardSegment key={email}>
        <span>{email}</span>
        {this.renderRemoveButton()}
      </CompactCardSegment>
    ));

    return (
      <SectionGrid>
        <h2>Domains</h2>
        <h4>{DOMAINS_SUB_TITLE}</h4>
        <AddInputAddButtonRow>
          <Input placeholder="Add new domain" />
          {this.renderAddButton()}
        </AddInputAddButtonRow>
        {
          emailCardSegments.count() === 0
            ? (
              <i>No domains</i>
            )
            : (
              <Card>{emailCardSegments}</Card>
            )
        }
      </SectionGrid>
    );
  }

  renderRolesSection = () => {

    const { org } = this.props;
    const roles = org.get('roles', List());

    const roleCardSegments = roles.map((role :Map) => (
      <CompactCardSegment key={role.get('id')}>
        <span>{role.get('id')}</span>
        {this.renderRemoveButton()}
      </CompactCardSegment>
    ));

    return (
      <SectionGrid>
        <h2>Roles</h2>
        <h4>{ROLES_SUB_TITLE}</h4>
        <AddInputAddButtonRow>
          <Input placeholder="Add new role" />
          {this.renderAddButton()}
        </AddInputAddButtonRow>
        {
          roleCardSegments.count() === 0
            ? (
              <i>No roles</i>
            )
            : (
              <Card>{roleCardSegments}</Card>
            )
        }
      </SectionGrid>
    );
  }

  renderMembersSection = () => {

    const { org } = this.props;
    const members = org.get('members', List());

    const memberCardSegments = members.map((member :Map) => (
      <CompactCardSegment key={member.get('id')}>
        <span>{member.get('id')}</span>
        {this.renderRemoveButton()}
      </CompactCardSegment>
    ));

    return (
      <SectionGrid>
        <h2>Members</h2>
        <h4>{MEMBERS_SUB_TITLE}</h4>
        <SearchInput placeholder="Add new member (search by name)" />
        {
          memberCardSegments.count() === 0
            ? (
              <i>No members</i>
            )
            : (
              <Card>{memberCardSegments}</Card>
            )
        }
      </SectionGrid>
    );
  }

  renderPermissions = () => {

    return (
      <Card>
        <CardSegment vertical>
          Manage Permissions
        </CardSegment>
      </Card>
    );
  }

  renderEntitySets = () => {

    return (
      <Card>
        <CardSegment vertical>
          Entity Set
        </CardSegment>
      </Card>
    );
  }

  render() {

    const { org, requestStates } = this.props;

    if (requestStates[GET_ORGANIZATION] === RequestStates.PENDING) {
      return (
        <Spinner size="2x" />
      );
    }

    return (
      <>
        <OrgTitle>{org.get('title')}</OrgTitle>
        <Tabs>
          <OrgNavLink exact to={Routes.ORG.replace(Routes.ID_PATH, org.get('id'))}>
            Organization Details
          </OrgNavLink>
          <OrgNavLink exact to={Routes.ORG_PERMISSIONS.replace(Routes.ID_PATH, org.get('id'))}>
            Permissions
          </OrgNavLink>
          <OrgNavLink exact to={Routes.ORG_ENTITY_SETS.replace(Routes.ID_PATH, org.get('id'))}>
            Entity Sets
          </OrgNavLink>
        </Tabs>
        <Switch>
          <Route path={Routes.ORG_PERMISSIONS} render={this.renderPermissions} />
          <Route path={Routes.ORG_ENTITY_SETS} render={this.renderEntitySets} />
          <Route render={this.renderOrgDetails} />
        </Switch>
      </>
    );
  }
}

const mapStateToProps = (state :Map<*, *>, props) => {

  const {
    params: {
      id: orgId = null,
    } = {},
  } = props.match;

  return {
    orgId,
    org: state.getIn(['orgs', 'orgs', orgId], Map()),
    requestStates: {
      [GET_ORGANIZATION]: state.getIn(['orgs', GET_ORGANIZATION, 'requestState']),
    },
  };
};

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getOrganization: OrganizationsApiActions.getOrganization,
    goToRoot: RoutingActions.goToRoot,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(OrgContainer);
