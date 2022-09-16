import IQuery from '../interfaces/IQuery';
import { SearchState } from '../interfaces/ISearch';

type ActionMap<M extends { [index: string]: unknown }> = {
  [Key in keyof M]: M[Key] extends undefined ? { type: Key } : { type: Key; payload: M[Key] };
};

export enum Types {
  SetState = 'SET_STATE',
  SetStage = 'SET_STAGE',
  SetDrawer = 'SET_DRAWER',
  SetQuery = 'SET_QUERY',
  SetStopWords = 'SET_STOP_WORDS',
  SetLimit = 'SET_LIMIT',
  SetSeed = 'SET_SEED',
  SetHarvests = 'SET_HARVESTS',
  SetSearchState = 'SET_SEARCH_STATE',
  SetQueryId = 'SET_QUERY_ID',
  SetQueries = 'SET_QUERIES'
}

enum Stage {
  QUERY,
  ANALYTICS,
  PROCESS
}

type SearchType = {
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

type SearchPayload = {
  [Types.SetState]: {
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
  [Types.SetStage]: {
    stage: Stage;
  };
  [Types.SetDrawer]: {
    drawerOpen: boolean;
  };
  [Types.SetQuery]: {
    query: string;
  };
  [Types.SetStopWords]: {
    stopWords: string[];
  };
  [Types.SetLimit]: {
    entriesLimit: number;
  };
  [Types.SetSeed]: {
    seed: number | null;
  };
  [Types.SetHarvests]: {
    harvests: string[];
  };
  [Types.SetSearchState]: {
    searchState: SearchState;
  };
  [Types.SetQueryId]: {
    queryId: number | null;
  };
  [Types.SetQueries]: {
    queries: IQuery[];
  };
};

export type SearchActions = ActionMap<SearchPayload>[keyof ActionMap<SearchPayload>];

export const searchReducer = (state: SearchType, action: SearchActions) => {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'SET_HARVESTS':
      return {
        ...state,
        harvests: action.payload.harvests
      };
    case 'SET_STAGE':
      return {
        ...state,
        stage: action.payload.stage
      };
    case 'SET_QUERY':
      return {
        ...state,
        query: action.payload.query
      };
    case 'SET_DRAWER':
      return {
        ...state,
        drawerOpen: action.payload.drawerOpen
      };
    case 'SET_LIMIT':
      return {
        ...state,
        entriesLimit: action.payload.entriesLimit
      };
    case 'SET_SEED':
      return {
        ...state,
        seed: action.payload.seed
      };
    case 'SET_QUERIES':
      return { ...state, queries: action.payload.queries };
    default:
      return state;
  }
};
