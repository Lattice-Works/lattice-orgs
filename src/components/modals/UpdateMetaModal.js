/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import _isFunction from 'lodash/isFunction';
import { Form } from 'lattice-fabricate';
import { Modal, ModalFooter, Typography } from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import type { RequestState } from 'redux-reqseq';

import type { RJSFError } from '~/common/types';

import ModalBody from './ModalBody';

import { StackGrid } from '../grids';
import { ResetOnUnmount } from '../other';

const { isFailure, isPending, isSuccess } = ReduxUtils;

type MetaFields = {
  description :string;
  title :string;
};

type FormData = {|
  fields :MetaFields;
|};

const UpdateMetaModal = ({
  isVisible,
  onClose,
  onSubmit,
  requestState,
  requestStateAction,
  schema,
} :{|
  isVisible :boolean;
  onClose :() => void;
  onSubmit :(data :MetaFields) => void;
  requestState :?RequestState;
  requestStateAction :string;
  schema :{|
    dataSchema :Object;
    uiSchema :Object;
  |};
|}) => {

  const [data, setData] = useState({});
  const [isValid, setIsValid] = useState(true);
  const resetActions = useMemo(() => [requestStateAction], [requestStateAction]);

  useEffect(() => {
    if (isVisible) {
      setData({});
      setIsValid(true);
    }
  }, [isVisible, schema]);

  useEffect(() => {
    // WARNING: this has the potential for an infinite loop if "isVisible" is not in the condition
    if (isSuccess(requestState) && isVisible) {
      if (_isFunction(onClose)) {
        onClose();
      }
    }
  }, [isVisible, onClose, requestState]);

  const handleOnChangeForm = ({
    errors,
    formData,
  } :{
    errors :RJSFError[];
    formData :FormData;
  }) => {
    setData(formData);
    setIsValid(errors.length === 0);
  };

  const handleOnClickPrimary = () => {
    if (_isFunction(onSubmit) && isValid) {
      onSubmit(data.fields);
    }
  };

  // TODO: figure out why this is throwing that "unique key prop" error if the "key" prop is not set
  const withFooter = (
    <ModalFooter
        isDisabledPrimary={!isValid}
        isPendingPrimary={isPending(requestState)}
        key="modal-footer"
        onClickPrimary={handleOnClickPrimary}
        shouldStretchButtons
        textPrimary="Save" />
  );

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        textTitle="Edit Details"
        withFooter={withFooter}>
      <ResetOnUnmount actions={resetActions}>
        <ModalBody>
          <StackGrid>
            <Form
                formData={data}
                hideSubmit
                liveValidate
                noPadding
                onChange={handleOnChangeForm}
                schema={schema.dataSchema}
                uiSchema={schema.uiSchema} />
            {
              isFailure(requestState) && (
                <Typography color="error">Failed to save changes. Please try again.</Typography>
              )
            }
          </StackGrid>
        </ModalBody>
      </ResetOnUnmount>
    </Modal>
  );
};

export default UpdateMetaModal;
