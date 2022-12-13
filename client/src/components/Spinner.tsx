import React from 'react';
import { makeStyles, Theme, createStyles, CircularProgress } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex'
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3)
    }
  })
);

function Spinner() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <main className={classes.content}>
        <CircularProgress />
      </main>
    </div>
  );
}

export default Spinner;
