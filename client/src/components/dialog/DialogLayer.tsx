import React, { useCallback, useContext } from 'react';
import { Dialog, DialogContent } from '@material-ui/core';

import { DialogContext } from './Dialog.context';
import { DialogLayerProps } from './types';

export const DialogLayer = ({ id, content, size, onClose, ...props }: DialogLayerProps) => {
  const { close } = useContext(DialogContext);

  const handleClose = useCallback(() => {
    onClose?.();
    close(id);
  }, [close]);

  return (
    <Dialog maxWidth={size} fullWidth onClose={handleClose} open>
      <DialogContent style={{ overflow: 'hidden' }}>
        {content({ ...props, onClose: handleClose })}
      </DialogContent>
    </Dialog>
  );
};
