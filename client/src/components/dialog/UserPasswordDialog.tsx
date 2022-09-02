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

const UserPasswordDialog = ({
  onClose,
  values: { id, name, username, role }
}: DialogContentProps<IUser>) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [password, setPassword] = useState('');

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const savePassword = () => {
    fetch('/api/user/' + id + '/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password
      })
    })
      .then((response) => {
        if (response.ok) {
          return response.text();
        }
        throw new Error();
      })
      .then((response) => {
        addNotification(
          t('login.password'),
          t('administration.users.notifications.passwordChangedSuccess'),
          'success'
        );
        onClose();
      })
      .catch(() => {
        addNotification(
          t('login.password'),
          t('administration.users.notifications.passwordChangedError'),
          'danger'
        );
      });
  };

  return (
    <Grid container spacing={2} className={classes.dialog}>
      <Grid item xs={12} justifyContent="space-between">
        <Typography variant="h2">
          {t<string>('administration.users.actions.changePassword')}
          {/*-{' '}*/}
          {/*{t<string>('administration.users.roles.' + role)} - {username}*/}
        </Typography>
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Grid>
      {/*<Grid item xs={12}>*/}
      {/*  <Typography variant="h2">{t<string>('login.password')}</Typography>*/}
      {/*</Grid>*/}
      <Grid item xs={12}>
        <TextField
          label={t<string>('login.password')}
          type="password"
          variant="outlined"
          value={password}
          onChange={handleChangePassword}
          fullWidth
          focused
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container justifyContent="flex-end" spacing={2}>
          <Grid item>
            <Button
              key="repeat"
              variant="outlined"
              color={'primary'}
              size="medium"
              onClick={savePassword}>
              <>
                {/*<ReplayIcon className={classes.icon} color="primary" />*/}
                {t<string>('filters.stopWords.save')}
              </>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default UserPasswordDialog;
