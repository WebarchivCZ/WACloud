export default interface IQuery {
  searchType: string,
  searchText: string,
  queries: string[],
  query: string,
  context: boolean,
  contextSize?: number,
  limit?: number
}
