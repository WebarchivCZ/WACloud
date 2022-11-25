import IAnalyticQuery from './IAnalyticQuery';
import IUser from './IUser';

export type SearchState = 'WAITING' | 'INDEXING' | 'PROCESSING' | 'ERROR' | 'DONE' | 'STOPPED';

export default interface ISearch {
  id: number;
  user: IUser;
  state: SearchState;
  warcArchiveState: SearchState;
  name: string;
  entries: number;
  indexed: number;
  toIndex: number;
  randomSeed: number | null;
  harvests: string[];
  filter: string;
  startedAt: string;
  updatedAt: string;
  finishedAt: string;
  createdAt: string;
  queries: IAnalyticQuery[];
  stopWords: string[];
  favorite: boolean;
}
