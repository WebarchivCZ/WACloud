import IAnalyticQuery from './IAnalyticQuery';
import IUser from './IUser';
import ISearch from "./ISearch";

export default interface IPageable<S> {
  number: number;
  content: S[];
  totalPages: number;
  totalElements: number;
}
