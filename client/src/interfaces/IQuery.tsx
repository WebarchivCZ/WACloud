import { Type } from './Type';
import { Format } from './Format';
import { Sorting } from './Sorting';

export default interface IQuery {
  searchType: Type;
  searchText?: string;
  searchTextOpposite?: string;
  queries?: string[];
  queriesOpposite?: string[];
  query?: string;
  context?: boolean;
  useOnlyDomains?: boolean;
  useOnlyDomainsOpposite?: boolean;
  contextSize?: number;
  limit?: number;
  format?: Format;
  sorting?: Sorting[];
}
