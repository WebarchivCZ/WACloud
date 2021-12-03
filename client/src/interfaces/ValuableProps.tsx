import {Dispatch, SetStateAction} from "react";

export interface ValuableProps<T> {
  setValue: Dispatch<SetStateAction<T>>;
  value: T;
  append?: (appendValue: string) => void;
}
