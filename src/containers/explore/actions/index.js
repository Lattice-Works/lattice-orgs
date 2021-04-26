/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const EXPLORE_ENTITY_DATA :'EXPLORE_ENTITY_DATA' = 'EXPLORE_ENTITY_DATA';
const exploreEntityData :RequestSequence = newRequestSequence(EXPLORE_ENTITY_DATA);

const EXPLORE_ENTITY_NEIGHBORS :'EXPLORE_ENTITY_NEIGHBORS' = 'EXPLORE_ENTITY_NEIGHBORS';
const exploreEntityNeighbors :RequestSequence = newRequestSequence(EXPLORE_ENTITY_NEIGHBORS);

export {
  EXPLORE_ENTITY_DATA,
  EXPLORE_ENTITY_NEIGHBORS,
  exploreEntityData,
  exploreEntityNeighbors,
};
