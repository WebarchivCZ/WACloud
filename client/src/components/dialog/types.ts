import { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';

import { SearchActions } from '../reducers';
import { SearchContext } from '../Search.context';

const history = useHistory();

export type DialogContentProps<T = undefined> = {
  values: T;
  onClose: () => void;
  onSubmit?: () => void;
  state?: SearchContext;
  dispatch?: React.Dispatch<SearchActions>;
  history?: typeof history;
};

export type DialogLayerProps<T = undefined> = DialogContentProps<T> & {
  id: string;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  content: (props: DialogContentProps<T>) => ReactNode;
};

export type DialogContextType = {
  layers: DialogLayerProps[];

  open: <T = undefined>(
    dialog: Omit<DialogLayerProps<T>, 'id' | 'onClose'> &
      Partial<Pick<DialogLayerProps<T>, 'onClose'>>
  ) => string;
  close: (id: string) => void;
};

export type ValidationObject = {
  valid: boolean;
  estimated: number;
};
