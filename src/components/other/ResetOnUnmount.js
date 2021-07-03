/*
 * @flow
 */

import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { resetRequestStates } from '~/core/redux/actions';

const ResetOnUnmount = ({
  actions,
  children,
} :{
  actions :string[];
  children :any;
}) => {

  const dispatch = useDispatch();

  useEffect(() => () => {
    dispatch(resetRequestStates(actions));
  }, [actions, dispatch]);

  return children;
};

export default ResetOnUnmount;
