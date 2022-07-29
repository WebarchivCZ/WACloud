export default interface IQuery {
  searchType: string;
  searchText: string;
  searchTextOpposite: string;
  queries: string[];
  queriesOpposite: string[];
  query: string;
  context: boolean;
  useOnlyDomains: boolean;
  useOnlyDomainsOpposite: boolean;
  contextSize?: number;
  limit?: number;
}
