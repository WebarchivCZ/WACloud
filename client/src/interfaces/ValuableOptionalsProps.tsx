import {ValuableProps} from "./ValuableProps";

export type ValuableOptionalsProps<T> = ValuableProps<T> & {
  options: string[];
}
