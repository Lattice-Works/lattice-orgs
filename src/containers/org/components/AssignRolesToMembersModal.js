/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import type { Role, UUID } from 'lattice';

import AssignRolesToMembersModalBody from './AssignRolesToMembersBody';

type Props = {
  isVisible :boolean;
  onClose :() => void;
  members :Map;
  roles :Role[];
  organizationId :UUID;
};

const AssignRolesToMembersModal = ({
  members,
  organizationId,
  roles,
  onClose,
  ...rest
} :Props) => (
  <Modal
    // eslint-disable-next-line
      {...rest}
      onClose={onClose}>
    <AssignRolesToMembersModalBody
        members={members}
        onClose={onClose}
        organizationId={organizationId}
        roles={roles} />
  </Modal>
);

export default AssignRolesToMembersModal;
