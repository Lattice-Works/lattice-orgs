import { OrderedSet } from 'immutable';

import { testShouldExportActionTypes, testShouldExportRequestSequences } from '~/common/testing/TestUtils';

import * as EDMActions from '.';

const ACTION_TYPES = OrderedSet([
  'GET_EDM_TYPES',
]).toJS();

const REQSEQ_NAMES = OrderedSet([
  'getEntityDataModelTypes',
]).toJS();

describe('EDMActions', () => {

  testShouldExportActionTypes(EDMActions, ACTION_TYPES);
  testShouldExportRequestSequences(EDMActions, ACTION_TYPES, REQSEQ_NAMES);
});
