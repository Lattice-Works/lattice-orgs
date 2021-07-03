/*
 * @flow
 */

import { Map } from 'immutable';
import type { UUID } from 'lattice';

import { DATA_SET_SCHEMA, EDM } from '~/common/constants';

export default function selectDataSetSchema(dataSetId :UUID) {

  return (state :Map) :?string => state.getIn([EDM, DATA_SET_SCHEMA, dataSetId]);
}
