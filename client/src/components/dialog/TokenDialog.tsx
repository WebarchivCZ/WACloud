import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  makeStyles,
  TextField,
  Typography,
  Box,
  Paper,
  MenuItem,
  IconButton,
  Checkbox,
  FormControlLabel,
  Chip,
  Button
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import ReplayIcon from '@material-ui/icons/Replay';

import ISearch from '../../interfaces/ISearch';
import { addNotification } from '../../config/notifications';
import ProcessStatus from '../ProcessStatus';
import IUser from '../../interfaces/IUser';

import { DialogContentProps } from './types';

const useStyles = makeStyles((theme) => ({
  header: {
    margin: theme.spacing(0, 0, 2)
  },
  chip: {
    margin: theme.spacing(0.5)
  },
  chipRoot: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: theme.spacing(0.5),
    margin: 0
  },
  dialog: {
    padding: '2rem',
    overflow: 'hidden !important'
  },
  words: {
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    marginRight: '1rem'
  },
  repeat: {
    marginLeft: 'auto'
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1)
  }
}));

const TokenDialog = ({ onClose, values }: DialogContentProps<string>) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Grid container spacing={2} className={classes.dialog}>
      <Grid item xs={12} justifyContent="space-between">
        <Typography variant="h2">
          {t<string>('administration.users.columns.accessToken')}
        </Typography>
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">{values}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container justifyContent="flex-end" spacing={2}>
          <Grid item>
            <Button
              key="repeat"
              variant="outlined"
              color={'primary'}
              size="medium"
              onClick={onClose}>
              <>
                {/*<ReplayIcon className={classes.icon} color="primary" />*/}
                {t<string>('query.favorites.close')}
              </>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TokenDialog;
