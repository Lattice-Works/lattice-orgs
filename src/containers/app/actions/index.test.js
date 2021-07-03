import { OrderedSet } from 'immutable';

import { testShouldExportActionTypes, testShouldExportRequestSequences } from '~/common/testing/TestUtils';

import * as AppActions from '.';

const ACTION_TYPES = OrderedSet([
  'INITIALIZE_APPLICATION',
]).toJS();

const REQSEQ_NAMES = OrderedSet([
  'initializeApplication',
]).toJS();

describe('AppActions', () => {

  testShouldExportActionTypes(AppActions, ACTION_TYPES);
  testShouldExportRequestSequences(AppActions, ACTION_TYPES, REQSEQ_NAMES);
});
