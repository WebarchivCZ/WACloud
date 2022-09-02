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
import _ from 'lodash';

import ISearch from '../../interfaces/ISearch';
import { addNotification } from '../../config/notifications';
import ProcessStatus from '../ProcessStatus';
import IUser from '../../interfaces/IUser';
import IQuery from '../../interfaces/IQuery';

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

const CreateUserDialog = ({ onClose }: DialogContentProps<any>) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleChangeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleChangeRole = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRole((event.target.checked as boolean) ? 'ADMIN' : 'USER');
  };

  const save = () => {
    fetch('/api/user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        username,
        role,
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
          t('administration.users.notifications.createSuccess'),
          'success'
        );
        onClose();
      })
      .catch(() => {
        addNotification(
          t('login.password'),
          t('administration.users.notifications.createError'),
          'danger'
        );
      });
  };

  return (
    <Grid container spacing={2} className={classes.dialog}>
      <Grid item xs={12} justifyContent="space-between">
        <Typography variant="h2">{t<string>('administration.users.roles.USER')}</Typography>
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          fullWidth
          label={t<string>('administration.users.columns.email')}
          value={username}
          onChange={handleChangeUsername}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label={t<string>('login.password')}
          type="password"
          variant="outlined"
          value={password}
          onChange={handleChangePassword}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          fullWidth
          label={t<string>('administration.users.columns.name')}
          value={name}
          onChange={handleChangeName}
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container justifyContent="flex-start" spacing={2}>
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox color="primary" checked={role == 'ADMIN'} onChange={handleChangeRole} />
              }
              label={t<string>('administration.users.roles.ADMIN')}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container justifyContent="flex-end" spacing={2}>
          <Grid item>
            <Button key="repeat" variant="outlined" color={'primary'} size="medium" onClick={save}>
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

export default CreateUserDialog;
