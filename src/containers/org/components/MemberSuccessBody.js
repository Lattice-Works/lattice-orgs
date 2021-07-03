/*
 * @flow
 */

import React, { useEffect } from 'react';

import { OrganizationsApiActions } from 'lattice-sagas';
import { useDispatch } from 'react-redux';
import type { UUID } from 'lattice';

import { ModalBody } from '~/components';

const { getOrganizationMembers } = OrganizationsApiActions;

type Props = {
  organizationId :UUID;
};

const MemberSuccessBody = ({ organizationId } :Props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getOrganizationMembers(organizationId));
  }, [dispatch, organizationId]);

  return (
    <ModalBody>
      <span>Success!</span>
    </ModalBody>
  );
};

export default MemberSuccessBody;
