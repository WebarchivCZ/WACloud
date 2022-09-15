import { ReactNode } from 'react';

export type DialogContentProps<T = undefined> = {
  values: T;
  onClose: () => void;
  onSubmit?: () => void;
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
