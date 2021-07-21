/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';
import {
  AuthorizationsApiSagas,
  CollaborationsApiSagas,
  DataSetsApiSagas,
  OrganizationsApiSagas,
  PrincipalsApiSagas
} from 'lattice-sagas';
import type { Saga } from '@redux-saga/core';

import * as AppSagas from '../../containers/app/sagas';
import * as CollaborationsSagas from '../../containers/collaborations/sagas';
import * as DataSagas from '../data/sagas';
import * as EDMSagas from '../edm/sagas';
import * as ExploreSagas from '../../containers/explore/sagas';
import * as OrgSagas from '../../containers/org/sagas';
import * as PermissionsSagas from '../permissions/sagas';
import * as RoutingSagas from '../router/RoutingSagas';
import * as SearchSagas from '../search/sagas';
import * as UsersSagas from '../users/sagas';

export default function* sagas() :Saga<*> {

  yield all([
    // "lattice-auth" sagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    // "lattice-sagas" sagas
    fork(CollaborationsApiSagas.addDataSetToCollaborationWatcher),
    fork(CollaborationsApiSagas.addOrganizationsToCollaborationWatcher),
    fork(CollaborationsApiSagas.deleteCollaborationWatcher),
    fork(CollaborationsApiSagas.getCollaborationDatabaseInfoWatcher),
    fork(CollaborationsApiSagas.getCollaborationsWithDataSetsWatcher),
    fork(CollaborationsApiSagas.getCollaborationsWithOrganizationWatcher),
    fork(CollaborationsApiSagas.removeDataSetFromCollaborationWatcher),
    fork(CollaborationsApiSagas.removeOrganizationsFromCollaborationWatcher),
    fork(CollaborationsApiSagas.renameCollaborationDatabaseWatcher),
    fork(AuthorizationsApiSagas.getAuthorizationsWatcher),
    fork(CollaborationsApiSagas.getCollaborationsWatcher),
    fork(DataSetsApiSagas.getOrganizationDataSetSchemaWatcher),
    fork(OrganizationsApiSagas.addDomainsToOrganizationWatcher),
    fork(OrganizationsApiSagas.addMemberToOrganizationWatcher),
    fork(OrganizationsApiSagas.addRoleToMemberWatcher),
    fork(OrganizationsApiSagas.createOrganizationWatcher),
    fork(OrganizationsApiSagas.createRoleWatcher),
    fork(OrganizationsApiSagas.deleteOrganizationWatcher),
    fork(OrganizationsApiSagas.deleteRoleWatcher),
    fork(OrganizationsApiSagas.destroyTransportedOrganizationEntitySetWatcher),
    fork(OrganizationsApiSagas.getAllOrganizationsWatcher),
    fork(OrganizationsApiSagas.getOrganizationDatabaseNameWatcher),
    fork(OrganizationsApiSagas.getOrganizationIntegrationAccountWatcher),
    fork(OrganizationsApiSagas.getOrganizationMembersWatcher),
    fork(OrganizationsApiSagas.getOrganizationWatcher),
    fork(OrganizationsApiSagas.grantTrustToOrganizationWatcher),
    fork(OrganizationsApiSagas.promoteStagingTableWatcher),
    fork(OrganizationsApiSagas.removeDomainsFromOrganizationWatcher),
    fork(OrganizationsApiSagas.removeMemberFromOrganizationWatcher),
    fork(OrganizationsApiSagas.removeRoleFromMemberWatcher),
    fork(OrganizationsApiSagas.renameOrganizationDatabaseWatcher),
    fork(OrganizationsApiSagas.revokeTrustFromOrganizationWatcher),
    fork(OrganizationsApiSagas.transportOrganizationEntitySetWatcher),
    fork(OrganizationsApiSagas.updateOrganizationDescriptionWatcher),
    fork(OrganizationsApiSagas.updateOrganizationTitleWatcher),
    fork(OrganizationsApiSagas.updateRoleGrantWatcher),

    // PrincipalsApiSagas
    fork(PrincipalsApiSagas.getAllUsersWatcher),
    fork(PrincipalsApiSagas.getAtlasCredentialsWatcher),
    fork(PrincipalsApiSagas.getSecurablePrincipalWatcher),
    fork(PrincipalsApiSagas.regenerateCredentialWatcher),

    // AppSagas
    fork(AppSagas.initializeApplicationWatcher),

    // CollaborationsSagas
    fork(CollaborationsSagas.createNewCollaborationWatcher),
    fork(CollaborationsSagas.getDataSetsInCollaborationWatcher),

    // DataSagas
    fork(DataSagas.fetchEntitySetDataWatcher),
    fork(DataSagas.submitDataGraphWatcher),

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),
    fork(EDMSagas.getOrgDataSetSizeWatcher),
    fork(EDMSagas.initializeOrganizationDataSetWatcher),
    fork(EDMSagas.updateOrganizationDataSetWatcher),

    // ExploreSagas
    fork(ExploreSagas.exploreEntityDataWatcher),
    fork(ExploreSagas.exploreEntityNeighborsWatcher),

    // OrgSagas
    fork(OrgSagas.addMembersToOrganizationWatcher),
    fork(OrgSagas.addRoleToOrganizationWatcher),
    fork(OrgSagas.assignRolesToMembersWatcher),
    fork(OrgSagas.createNewOrganizationWatcher),
    fork(OrgSagas.deleteExistingOrganizationWatcher),
    fork(OrgSagas.editOrganizationDetailsWatcher),
    fork(OrgSagas.editRoleDetailsWatcher),
    fork(OrgSagas.getOrganizationIntegrationDetailsWatcher),
    fork(OrgSagas.initializeOrganizationWatcher),
    fork(OrgSagas.removeRoleFromOrganizationWatcher),

    // PermissionsSagas
    fork(PermissionsSagas.assignPermissionsToDataSetWatcher),
    fork(PermissionsSagas.getCurrentRoleAuthorizationsWatcher),
    fork(PermissionsSagas.getDataSetPermissionsPageWatcher),
    fork(PermissionsSagas.getOrgDataSetObjectPermissionsWatcher),
    fork(PermissionsSagas.getOrgObjectPermissionsWatcher),
    fork(PermissionsSagas.getOrgRoleObjectPermissionsWatcher),
    fork(PermissionsSagas.getPermissionsWatcher),
    fork(PermissionsSagas.initializeObjectPermissionsWatcher),
    fork(PermissionsSagas.setPermissionsWatcher),
    fork(PermissionsSagas.updatePermissionsWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),

    // SearchSagas
    fork(SearchSagas.searchDataWatcher),
    fork(SearchSagas.searchOrganizationDataSetsWatcher),

    // SearchSagas
    fork(UsersSagas.searchAllUsersWatcher),
  ]);
}
