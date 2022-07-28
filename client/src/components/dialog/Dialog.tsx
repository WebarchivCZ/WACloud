import React, { useContext, FC } from 'react';
import { makeStyles } from '@material-ui/core';

import { DialogContext } from './Dialog.context';
import { DialogLayer } from './DialogLayer';

const useStyles = makeStyles(() => ({
  dialog: {
    overflowY: 'hidden'
  }
}));

export const Dialog: FC = () => {
  const { layers } = useContext(DialogContext);
  const classes = useStyles();

  return (
    (layers?.length && (
      <div className={classes.dialog}>
        {layers.map((layer) => (
          <DialogLayer key={layer.id} {...layer} />
        ))}
      </div>
    )) ||
    null
  );
};
