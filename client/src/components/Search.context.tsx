import React, { createContext, FC, useReducer } from 'react';

import stopWordsCzech from '../config/stopWords';
import IQuery from '../interfaces/IQuery';
import { SearchState } from '../interfaces/ISearch';
import { Type } from '../interfaces/Type';

import { SearchActions, searchReducer } from './reducers';

export enum Stage {
  QUERY,
  ANALYTICS,
  PROCESS
}

export type SearchContext = {
  stage: Stage;
  drawerOpen: boolean;
  query: string;
  stopWords: string[];
  entriesLimit: number;
  seed: number | null;
  harvests: string[];
  searchState: SearchState;
  queryId: number | null;
  queries: IQuery[];
  favorite?: boolean;
};

type Props = {
  children: React.ReactNode;
};

const initialState = {
  stage: Stage.QUERY,
  drawerOpen: true,
  query: '',
  stopWords: stopWordsCzech.sort(),
  entriesLimit: 100,
  seed: null,
  harvests: [],
  searchState: 'WAITING' as SearchState,
  queryId: null,
  favorite: undefined,
  queries: [
    {
      queries: [],
      queriesOpposite: [],
      query: '',
      context: false,
      searchText: '',
      searchTextOpposite: '',
      searchType: 'RAW' as Type,
      limit: 10,
      useOnlyDomains: false,
      useOnlyDomainsOpposite: false
    }
  ]
};

export const SearchContext = createContext<{
  state: SearchContext;
  dispatch: React.Dispatch<SearchActions>;
}>({
  state: initialState,
  dispatch: () => null
});

const SearchProvider: FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  return <SearchContext.Provider value={{ state, dispatch }}>{children}</SearchContext.Provider>;
};

export default SearchProvider;
