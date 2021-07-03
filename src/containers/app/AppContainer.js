/*
 * @flow
 */

import React, { useCallback, useEffect } from 'react';

import { AuthActions, AuthUtils } from 'lattice-auth';
import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
  AppNavigationWrapper,
  LatticeLuxonUtils,
  MuiPickersUtilsProvider,
  Spinner,
  StylesProvider,
  ThemeProvider,
  lightTheme,
} from 'lattice-ui-kit';
import { LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { INITIALIZE_APPLICATION, initializeApplication } from './actions';

import { OpenLatticeIconSVG } from '../../assets/svg/icons';
import { APP } from '~/common/constants';
import { BasicErrorComponent } from '../../components';
import { Routes } from '~/core/router';
import { AccountContainer } from '../account';
import { OrgRouter, OrgsContainer } from '../org';

// import { GOOGLE_TRACKING_ID } from '~/core/tracking/google/GoogleAnalytics';

declare var gtag :?Function;

const { isNonEmptyString } = LangUtils;

const AppContainer = () => {

  const dispatch = useDispatch();

  const logout = useCallback(() => {
    dispatch(AuthActions.logout());
    // if (isFunction(gtag)) {
    //   gtag('config', GOOGLE_TRACKING_ID, { user_id: undefined, send_page_view: false });
    // }
  }, [dispatch]);

  useEffect(() => {
    dispatch(initializeApplication());
  }, [dispatch]);

  const initAppRS :?RequestState = useRequestState([APP, INITIALIZE_APPLICATION]);

  const userInfo = AuthUtils.getUserInfo() || {};
  let user :?string = null;
  if (isNonEmptyString(userInfo.name)) {
    user = userInfo.name;
  }
  else if (isNonEmptyString(userInfo.email)) {
    user = userInfo.email;
  }

  return (
    <ThemeProvider theme={lightTheme}>
      <MuiPickersUtilsProvider utils={LatticeLuxonUtils}>
        <StylesProvider injectFirst>
          <AppContainerWrapper>
            <AppHeaderWrapper appIcon={OpenLatticeIconSVG} appTitle="Organizations" logout={logout} user={user}>
              <AppNavigationWrapper>
                <NavLink to={Routes.ROOT} />
                <NavLink to={Routes.ACCOUNT}>Account</NavLink>
              </AppNavigationWrapper>
            </AppHeaderWrapper>
            {
              initAppRS === RequestStates.PENDING && (
                <AppContentWrapper>
                  <Spinner size="2x" />
                </AppContentWrapper>
              )
            }
            {
              initAppRS === RequestStates.FAILURE && (
                <AppContentWrapper>
                  <BasicErrorComponent>
                    Sorry, the application failed to initialize. Please try refreshing the page, or contact support.
                  </BasicErrorComponent>
                </AppContentWrapper>
              )
            }
            {
              initAppRS === RequestStates.SUCCESS && (
                <Switch>
                  <Route path={Routes.ACCOUNT} component={AccountContainer} />
                  <Route path={Routes.ORG} component={OrgRouter} />
                  <Route path={Routes.ORGS} component={OrgsContainer} />
                  <Redirect to={Routes.ORGS} />
                </Switch>
              )
            }
          </AppContainerWrapper>
        </StylesProvider>
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  );
};

export default AppContainer;
