import React, { useContext, FC } from 'react';

import { DialogContext } from './Dialog.context';
import { DialogLayer } from './DialogLayer';

const Dialog: FC = () => {
  const { layers } = useContext(DialogContext);

  return (
    (layers?.length && (
      <div>
        {layers.map((layer) => (
          <DialogLayer key={layer.id} {...layer} />
        ))}
      </div>
    )) ||
    null
  );
};

export default Dialog;
