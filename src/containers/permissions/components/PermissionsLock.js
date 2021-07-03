/*
 * @flow
 */

import React from 'react';

import { faLock } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from 'lattice-ui-kit';

const PermissionsLock = () => (
  <Tooltip arrow placement="left" title="Unauthorized to view permissions">
    <div>
      <FontAwesomeIcon fixedWidth icon={faLock} />
    </div>
  </Tooltip>
);

export default PermissionsLock;
