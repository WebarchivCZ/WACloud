import React, { FC, createContext, useCallback, useState, ReactNode } from 'react';
import { v4 } from 'uuid';

import { DialogContextType } from './types';

export const DialogContext = createContext<DialogContextType>(undefined as never);

type Props = {
  children: ReactNode;
};

export const DialogProvider: FC<Props> = ({ children }) => {
  const [layers, setLayers] = useState<DialogContextType['layers']>([]);

  const open = useCallback<DialogContextType['open']>((dialog) => {
    const newDialog = { id: v4(), ...dialog };
    setLayers((l) => [...l, newDialog as never]);
    return newDialog.id;
  }, []);

  const close = useCallback<DialogContextType['close']>(
    (id) => setLayers((l) => l.filter((d) => d.id !== id)),
    [layers]
  );

  return (
    <DialogContext.Provider
      value={{
        layers,
        open,
        close
      }}>
      {children}
    </DialogContext.Provider>
  );
};
