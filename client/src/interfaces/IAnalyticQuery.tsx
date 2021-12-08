export default interface IAnalyticQuery {
  id: number,
  state: string,
  type: string,
  expressions: string[],
  contextSize?: number,
  limit?: number
}
