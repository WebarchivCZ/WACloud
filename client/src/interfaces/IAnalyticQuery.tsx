import { Type } from './Type';
import { Format } from './Format';
import { Sorting } from './Sorting';

export type AnalyticQueryState = 'WAITING' | 'RUNNING' | 'FINISHED' | 'ERROR';

export default interface IAnalyticQuery {
  id: number;
  state: AnalyticQueryState;
  type: Type;
  expressions: string[];
  expressionsOpposite?: string[];
  contextSize?: number;
  limit?: number;
  startedAt: string;
  updatedAt: string;
  createdAt: string;
  finishedAt: string;
  useOnlyDomains: boolean;
  useOnlyDomainsOpposite: boolean;
  format?: Format;
  sorting?: Sorting[];
}
