/*
 * @flow
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import debounce from 'lodash/debounce';
import { faSearch } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import { Select } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';

import { USERS } from '~/common/constants';
import { getUserProfile, getUserTitle } from '~/common/utils';
import { selectUserSearchResults } from '~/core/redux/selectors';
import { SEARCH_ALL_USERS, resetUserSearchResults, searchAllUsers } from '~/core/users/actions';
import type { ReactSelectOption } from '~/common/types';

const { isPending } = ReduxUtils;

const includeAll = () => true;

type Props = {
  onChange :(option ?:ReactSelectOption<Map>) => void;
  existingMembers ?:List;
};

const SearchMemberBar = ({
  onChange,
  existingMembers
} :Props) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const searchRequestState = useRequestState([USERS, SEARCH_ALL_USERS]);
  const userSearchResults = useSelector(selectUserSearchResults());

  const options = useMemo(() => {
    const selectOptions = [];
    userSearchResults.forEach((user) => {
      const { id } = getUserProfile(user);
      const exists = !!existingMembers?.find((member) => {
        const { id: existingMemberId } = getUserProfile(member);
        return id === existingMemberId;
      });

      if (!exists) {
        selectOptions.push({
          label: getUserTitle(user),
          value: user,
        });
      }
    }, [userSearchResults]);

    return selectOptions;
  }, [existingMembers, userSearchResults]);

  const debounceDispatchSearch = useCallback(debounce((value) => {
    if (value) {
      dispatch(searchAllUsers(value));
    }
    else {
      dispatch(resetUserSearchResults());
    }
  }, 250), []);

  useEffect(() => {
    debounceDispatchSearch(searchTerm.trim());
  }, [debounceDispatchSearch, searchTerm]);

  const handleInputChange = (query, { action }) => {
    if (action === 'input-change') {
      setSearchTerm(query);
    }
  };

  return (
    <Select
        closeMenuOnSelect={false}
        filterOption={includeAll}
        hideDropdownIcon
        inputIcon={<FontAwesomeIcon icon={faSearch} />}
        inputValue={searchTerm}
        isClearable
        isLoading={isPending(searchRequestState)}
        onChange={onChange}
        onInputChange={handleInputChange}
        options={options}
        placeholder="Search members"
        value={null} />
  );
};

SearchMemberBar.defaultProps = {
  existingMembers: List()
};

export default SearchMemberBar;
