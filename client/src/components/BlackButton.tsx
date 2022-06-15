import { Button, ButtonProps, makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(() => ({
  black: {
    backgroundColor: '#000000',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#111111'
    }
  }
}));

export const BlackButton: React.FunctionComponent<ButtonProps> = ({ children, ...props }) => {
  const classes = useStyles();
  return (
    <Button {...props} className={classes.black}>
      {children}
    </Button>
  );
};
