/*
 * @flow
 */

import { List, Map, Set } from 'immutable';
import type {
  Ace,
  PermissionType,
  PropertyType,
  UUID,
} from 'lattice';

import { ID } from '~/common/constants';

function computePermissionAssignments(
  myKeys :Set<List<UUID>>,
  dataSetColumns :Map<UUID, Map>,
  dataSetId :UUID,
  permissions :Map<List<UUID>, Ace>,
  permissionType :PermissionType,
  maybePropertyTypes :Map<UUID, PropertyType>,
) :{
  isAssignedToAll :boolean;
  isAssignedToOnlyNonPII :boolean;
  isOwnerOfAtLeastOneColumn :boolean;
} {

  let isAssignedToAll = true;
  let isAssignedToOnlyNonPII = true;
  let isOwnerOfAtLeastOneColumn = false;

  dataSetColumns.forEach((column :Map) => {
    const columnId :UUID = column.get(ID);
    const propertyType :?PropertyType = maybePropertyTypes.get(columnId);
    const pii :boolean = propertyType?.pii || false;
    const key :List<UUID> = List([dataSetId, columnId]);
    const isOwner = myKeys.has(key);
    if (isOwner) {
      isOwnerOfAtLeastOneColumn = true;
      const ace :?Ace = permissions.get(key);
      const isPermissionAssigned = ace ? ace.permissions.includes(permissionType) : false;
      isAssignedToAll = isAssignedToAll && isPermissionAssigned;
      if ((isPermissionAssigned && pii === true) || (!isPermissionAssigned && pii === false)) {
        isAssignedToOnlyNonPII = false;
      }
    }
  });

  return { isAssignedToAll, isAssignedToOnlyNonPII, isOwnerOfAtLeastOneColumn };
}

export default computePermissionAssignments;
