/*
 * @flow
 */

import { Children } from 'react';
import type { ComponentType } from 'react';

import _isInteger from 'lodash/isInteger';
import styled from 'styled-components';

const GapGrid :ComponentType<{
  children :any;
  gap ?:number;
}> = styled.div`
  align-items: center;
  display: grid;
  grid-gap: ${({ gap }) => (_isInteger(gap) ? gap : 16)}px;
  grid-template-columns: repeat(${({ children }) => Children.count(children)}, auto) 1fr;
`;

export default GapGrid;
