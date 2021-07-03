/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { Map } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { PrincipalsApiActions } from 'lattice-sagas';
import {
  Alert,
  AppContentWrapper,
  Input,
  Snackbar,
  Typography
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { UserInfo } from 'lattice-auth';
import type { RequestState } from 'redux-reqseq';

import { ACCOUNT } from '~/common/constants';
import { clipboardWriteText } from '~/common/utils';
import {
  ActionsGrid,
  CopyButton,
  Pre,
  RefreshButton,
  StackGrid,
} from '~/components';
import { selectAtlasCredentials } from '~/core/redux/selectors';

import { clearAtlasCredentials } from './actions';

const REGENERATE_SUCCESS = 'Atlas credential successfully regenerated.';
const REGENERATE_FAILURE = 'Atlas credential failed to regenerate.';

const {
  isFailure,
  isPending,
  isStandby,
  isSuccess,
} = ReduxUtils;

const {
  GET_ATLAS_CREDENTIALS,
  REGENERATE_CREDENTIAL,
  getAtlasCredentials,
  regenerateCredential,
} = PrincipalsApiActions;

const DASHES :'---' = '---';

const PasswordInput = (
  <Input disabled type="password" value="********************************" />
);

const AccountContainer = () => {

  const dispatch = useDispatch();

  const getAtlasCredentialsRS :?RequestState = useRequestState([ACCOUNT, GET_ATLAS_CREDENTIALS]);
  const regenerateAtlasCredentialsRS :?RequestState = useRequestState([ACCOUNT, REGENERATE_CREDENTIAL]);
  const atlasCredentials :Map = useSelector(selectAtlasCredentials());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('');

  const getAtlasCredentialsIsPending = isPending(getAtlasCredentialsRS);
  const getAtlasCredentialsIsStandby = isStandby(getAtlasCredentialsRS);
  const getAtlasCredentialsIsSuccess = isSuccess(getAtlasCredentialsRS);

  const regenerateAtlasCredentialsIsPending = isPending(regenerateAtlasCredentialsRS);
  const regenerateAtlasCredentialsIsSuccess = isSuccess(regenerateAtlasCredentialsRS);
  const regenerateAtlasCredentialsIsFailure = isFailure(regenerateAtlasCredentialsRS);

  const atlasCredentialsPending = getAtlasCredentialsIsPending
    || getAtlasCredentialsIsStandby
    || regenerateAtlasCredentialsIsPending;

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    setSnackbarText('');
    setSnackbarSeverity('');
  };

  const regenerateAtlasCredential = () => {
    dispatch(regenerateCredential());
  };

  const thisUserInfo :UserInfo = AuthUtils.getUserInfo() || {};

  useEffect(() => {
    if (regenerateAtlasCredentialsIsSuccess && getAtlasCredentialsIsSuccess) {
      setSnackbarText(REGENERATE_SUCCESS);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
    else if (regenerateAtlasCredentialsIsFailure) {
      setSnackbarText(REGENERATE_FAILURE);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [
    regenerateAtlasCredentialsIsSuccess,
    regenerateAtlasCredentialsIsFailure,
    getAtlasCredentialsIsSuccess,
    setSnackbarOpen,
    setSnackbarSeverity,
    setSnackbarText
  ]);

  useEffect(() => {
    if (regenerateAtlasCredentialsIsSuccess) {
      dispatch(getAtlasCredentials());
    }
  }, [dispatch, regenerateAtlasCredentialsIsSuccess]);

  useEffect(() => {
    dispatch(getAtlasCredentials());
  }, [dispatch]);

  useEffect(() => () => {
    dispatch(clearAtlasCredentials());
  }, [dispatch]);

  return (
    <AppContentWrapper>
      <StackGrid>
        <Typography variant="h1">Account Details</Typography>
        <div>
          <Typography component="h2" variant="body2">FIRST NAME</Typography>
          <Typography>{thisUserInfo.givenName || DASHES}</Typography>
        </div>
        <div>
          <Typography component="h2" variant="body2">LAST NAME</Typography>
          <Typography>{thisUserInfo.familyName || DASHES}</Typography>
        </div>
        <div>
          <Typography component="h2" variant="body2">EMAIL</Typography>
          <Typography>{thisUserInfo.email || DASHES}</Typography>
        </div>
        <StackGrid gap={4}>
          <Typography component="h2" variant="body2">USER ID</Typography>
          <ActionsGrid align={{ v: 'center' }} fit>
            <Pre>{thisUserInfo.id}</Pre>
            <CopyButton
                aria-label="copy user id"
                onClick={() => clipboardWriteText(thisUserInfo.id)} />
          </ActionsGrid>
        </StackGrid>
        <StackGrid gap={4}>
          <Typography component="h2" variant="body2">AUTH0 JWT TOKEN</Typography>
          <ActionsGrid fit>
            {PasswordInput}
            <CopyButton
                aria-label="copy auth0 jwt token"
                onClick={() => clipboardWriteText(AuthUtils.getAuthToken())} />
          </ActionsGrid>
        </StackGrid>
        <StackGrid gap={4}>
          <Typography component="h2" variant="body2">ATLAS USERNAME</Typography>
          <ActionsGrid fit>
            {PasswordInput}
            <CopyButton
                aria-label="copy atlas username"
                isPending={atlasCredentialsPending}
                onClick={() => clipboardWriteText(atlasCredentials.get('username'))} />
          </ActionsGrid>
        </StackGrid>
        <StackGrid gap={4}>
          <Typography component="h2" variant="body2">ATLAS CREDENTIAL</Typography>
          <ActionsGrid fit>
            {PasswordInput}
            <CopyButton
                aria-label="copy atlas credential"
                isPending={atlasCredentialsPending}
                onClick={() => clipboardWriteText(atlasCredentials.get('credential'))} />
            <RefreshButton
                aria-label="regenerate atlas credential"
                isPending={atlasCredentialsPending}
                onClick={regenerateAtlasCredential} />
          </ActionsGrid>
        </StackGrid>
      </StackGrid>
      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleClose}>
        {
          snackbarOpen && (
            <Alert onClose={handleClose} severity={snackbarSeverity}>
              {snackbarText}
            </Alert>
          )
        }
      </Snackbar>
    </AppContentWrapper>
  );
};

export default AccountContainer;
