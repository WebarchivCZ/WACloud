import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  makeStyles,
  TextField,
  Typography,
  IconButton,
  Button,
  Divider
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import { addNotification } from '../../config/notifications';
import { SearchContext } from '../../components/Search.context';
import { Types } from '../../components/reducers';

import { DialogContentProps } from './types';

const useStyles = makeStyles((theme) => ({
  header: {
    margin: theme.spacing(0, 0, 2)
  },
  dialog: {
    padding: '2rem',
    overflow: 'hidden !important'
  },
  divider: {
    margin: '1rem auto'
  },
  icon: {
    marginRight: '1rem'
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1)
  }
}));

const AddToFavoriteDialog = ({
  onClose,
  onSubmit,
  values: { id }
}: DialogContentProps<{ id: number }>) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [name, setName] = useState('');
  const { state, dispatch } = useContext(SearchContext);

  return (
    <Grid container spacing={2} className={classes.dialog}>
      <Grid item xs={12} justifyContent="space-between">
        <Typography variant="h2">{t<string>('query.favorites.popUpHeader')}</Typography>
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Grid>
      <Grid item xs={12}>
        {t<string>('query.favorites.setNameFirst')}
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          fullWidth
          required
          value={name}
          placeholder={t<string>('query.favorites.insertName')}
          onChange={(e) => setName(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Divider className={classes.divider} />
      </Grid>
      <Grid item xs={12}>
        <Grid container justifyContent="flex-start" spacing={2}>
          <Grid item>
            <Button
              key="save"
              variant="contained"
              color={'primary'}
              size="large"
              onClick={() => {
                fetch(`/api/search/favorite/${id}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    name
                  })
                })
                  .then((response) => {
                    if (response.ok) {
                      return response.json();
                    }
                    throw new Error();
                  })
                  .then(() => {
                    addNotification(
                      t('header.favorite'),
                      t('administration.users.notifications.favoriteSuccess'),
                      'success'
                    );
                    dispatch({
                      type: Types.SetState,
                      payload: {
                        ...state,
                        favorite: state.favorite === undefined ? true : !state.favorite
                      }
                    });
                  })
                  .catch(() => {
                    addNotification(
                      t('header.favorite'),
                      t('administration.users.notifications.favoriteError', 'danger')
                    );
                  });
                onClose();
                onSubmit?.();
              }}>
              {t<string>('query.favorites.save')}
            </Button>
          </Grid>
          <Grid item>
            <Button key="close" variant="outlined" color={'primary'} size="large" onClick={onClose}>
              {t<string>('query.favorites.close')}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default AddToFavoriteDialog;
