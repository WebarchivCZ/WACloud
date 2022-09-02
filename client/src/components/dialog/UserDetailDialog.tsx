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

const UserDetailDialog = ({ onClose, values }: DialogContentProps<IUser>) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [name, setName] = useState(values.name);
  const [username, setUsername] = useState(values.username);
  const [enabled, setEnabled] = useState(values.enabled);
  const [role, setRole] = useState(values.role);

  const handleChangeEnabled = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnabled(event.target.checked as boolean);
  };

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleChangeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleChangeRole = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRole((event.target.checked as boolean) ? 'ADMIN' : 'USER');
  };

  const save = () => {
    fetch('/api/user/' + values.id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        username,
        role,
        enabled
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
          t('administration.users.notifications.changedSuccess'),
          'success'
        );
        onClose();
      })
      .catch(() => {
        addNotification(
          t('login.password'),
          t('administration.users.notifications.changedError'),
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
          variant="outlined"
          fullWidth
          label={t<string>('administration.users.columns.name')}
          value={name}
          onChange={handleChangeName}
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container justifyContent="space-between" spacing={2}>
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox color="primary" checked={enabled} onChange={handleChangeEnabled} />
              }
              label={t<string>('administration.users.states.ACTIVE')}
            />
          </Grid>
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

export default UserDetailDialog;
