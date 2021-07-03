/*
 * @flow
 */

import React from 'react';

import { faChevronRight } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CrumbSeparator = ({
  icon,
  size,
} :{
  icon ?:any;
  size ?:string;
}) => (
  <FontAwesomeIcon icon={icon} fixedWidth size={size} />
);

CrumbSeparator.defaultProps = {
  icon: faChevronRight,
  size: 'sm',
};

export default CrumbSeparator;
