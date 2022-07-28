import IAnalyticQuery from './IAnalyticQuery';
import IUser from './IUser';

export type SearchState = 'WAITING' | 'INDEXING' | 'PROCESSING' | 'ERROR' | 'DONE';

export default interface ISearch {
  id: number;
  user: IUser;
  state: SearchState;
  name: string;
  entries: number;
  indexed: number;
  toIndex: number;
  randomSeed: string;
  harvests: string[];
  filter: string;
  startedAt: string;
  finishedAt: string;
  createdAt: string;
  queries: IAnalyticQuery[];
}
