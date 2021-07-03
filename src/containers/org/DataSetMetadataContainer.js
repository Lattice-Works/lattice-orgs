/*
 * @flow
 */

import React, {
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';

import { List, Map } from 'immutable';
import { AppContentWrapper, Table } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  DATA_TYPE,
  DESCRIPTION,
  EDIT_TITLE_DESCRIPTION_DATA_SCHEMA as DATA_SCHEMA,
  EDIT_TITLE_DESCRIPTION_UI_SCHEMA as UI_SCHEMA,
  EDM,
  ID,
  METADATA,
  TITLE,
} from '~/common/constants';
import { UpdateMetaModal } from '~/components';
import { UPDATE_ORGANIZATION_DATA_SET, updateOrganizationDataSet } from '~/core/edm/actions';
import { selectMyKeys, selectOrgDataSetColumns } from '~/core/redux/selectors';

import EditableMetadataRow from './components/EditableMetadataRow';

const TABLE_HEADERS = [
  { key: 'title', label: 'TITLE' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'dataType', label: 'DATA TYPE' },
  {
    cellStyle: { width: '56px' }, // 36px icon width + 10px left/right padding
    key: 'action',
    label: '',
    sortable: false,
  },
];
const OPEN :'OPEN' = 'OPEN';
const CLOSE :'CLOSE' = 'CLOSE';

const INITIAL_MODAL_STATE = {
  data: {},
  isVisible: false,
  schema: {
    dataSchema: DATA_SCHEMA,
    uiSchema: UI_SCHEMA,
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case OPEN: {
      const dataSchema = JSON.parse(JSON.stringify(DATA_SCHEMA));
      dataSchema.properties.fields.properties.title.default = action.payload.title;
      dataSchema.properties.fields.properties.title.description = "Update this column's title";
      dataSchema.properties.fields.properties.description.default = action.payload.description;
      dataSchema.properties.fields.properties.description.description = "Update this column's description";
      return {
        data: action.payload,
        isVisible: true,
        schema: {
          dataSchema,
          uiSchema: UI_SCHEMA
        },
      };
    }
    case CLOSE:
      return { ...state, data: {}, isVisible: false };
    default:
      return state;
  }
};

const DataSetMetadataContainer = ({
  dataSetId,
  organizationId,
} :{|
  dataSetId :UUID;
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();

  const [modalState, modalDispatch] = useReducer(reducer, INITIAL_MODAL_STATE);
  const [tableData, setTableData] = useState([]);

  const updateOrgDataSetRS :?RequestState = useRequestState([EDM, UPDATE_ORGANIZATION_DATA_SET]);

  const dataSetColumns :Map<UUID, Map> = useSelector(selectOrgDataSetColumns(organizationId, dataSetId));
  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());
  const isDataSetOwner :boolean = myKeys.has(List([dataSetId]));

  useEffect(() => {
    const data :List = dataSetColumns
      .valueSeq()
      .map((column :Map) => ({
        dataType: column.get(DATA_TYPE),
        description: column.getIn([METADATA, DESCRIPTION]),
        id: column.get(ID),
        title: column.getIn([METADATA, TITLE]),
      }));
    setTableData(data.toJS());
  }, [dataSetColumns]);

  const handleOnSubmitUpdate = ({ description, title }) => {
    dispatch(
      updateOrganizationDataSet({
        columnId: modalState.data.id,
        dataSetId,
        description,
        organizationId,
        title,
      })
    );
  };

  const components = useMemo(() => ({
    Row: ({ data, components: innerComponents, headers } :any) => (
      <EditableMetadataRow
          components={innerComponents}
          data={data}
          headers={headers}
          isOwner={isDataSetOwner}
          key={data.id}
          onClick={() => modalDispatch({ type: OPEN, payload: data })} />
    )
  }), [isDataSetOwner]);

  return (
    <AppContentWrapper>
      <Table components={components} data={tableData} headers={TABLE_HEADERS} />
      <UpdateMetaModal
          isVisible={modalState.isVisible}
          onClose={() => modalDispatch({ type: CLOSE })}
          onSubmit={handleOnSubmitUpdate}
          requestState={updateOrgDataSetRS}
          requestStateAction={UPDATE_ORGANIZATION_DATA_SET}
          schema={modalState.schema} />
    </AppContentWrapper>
  );
};

export default DataSetMetadataContainer;
