import IAnalyticQuery from "./IAnalyticQuery";

export default interface ISearch {
  id: number,
  state: string,
  name: string,
  entries: number,
  indexed: number,
  toIndex: number,
  randomSeed: string,
  harvests: string[],
  filter: string
  startedAt: string,
  finishedAt: string,
  createdAt: string,
  queries: IAnalyticQuery[]
}
