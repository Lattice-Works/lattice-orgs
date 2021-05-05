/*
 * @flow
 */

import type { ComponentType } from 'react';

import styled from 'styled-components';
import { AppContentWrapper } from 'lattice-ui-kit';

const NavContentWrapper :ComponentType<{|
  bgColor ?:string;
  children ?:any;
|}> = styled(AppContentWrapper)`
  border-bottom: none;

  > div {
    padding: 0;
  }
`;

export default NavContentWrapper;
