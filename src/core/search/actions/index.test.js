import { OrderedSet } from 'immutable';

import { testShouldExportActionTypes, testShouldExportRequestSequences } from '~/common/testing/TestUtils';

import * as SearchActions from '.';

const ACTION_TYPES = OrderedSet([
  'SEARCH_DATA',
  'SEARCH_ORGANIZATION_DATA_SETS',
]).toJS();

const REQSEQ_NAMES = OrderedSet([
  'searchData',
  'searchOrganizationDataSets',
]).toJS();

describe('SearchActions', () => {

  testShouldExportActionTypes(SearchActions, ACTION_TYPES);
  testShouldExportRequestSequences(SearchActions, ACTION_TYPES, REQSEQ_NAMES);
});
