/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const FETCH_ENTITY_SET_DATA :'FETCH_ENTITY_SET_DATA' = 'FETCH_ENTITY_SET_DATA';
const fetchEntitySetData :RequestSequence = newRequestSequence(FETCH_ENTITY_SET_DATA);

const SUBMIT_DATA_GRAPH :'SUBMIT_DATA_GRAPH' = 'SUBMIT_DATA_GRAPH';
const submitDataGraph :RequestSequence = newRequestSequence(SUBMIT_DATA_GRAPH);

export {
  FETCH_ENTITY_SET_DATA,
  SUBMIT_DATA_GRAPH,
  fetchEntitySetData,
  submitDataGraph,
};
