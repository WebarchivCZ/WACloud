import {
  Box,
  Button,
  createStyles,
  Grid,
  Link,
  makeStyles,
  TextField,
  Theme,
  Typography
} from '@material-ui/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';

import logoWebArchive from '../images/webarchiv-logo.svg';
import Spinner from '../components/Spinner';
import { addNotification } from '../config/notifications';
import { useAuth } from '../services/useAuth';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexGrow: 1,
      marginTop: '30px',
      textAlign: 'center'
    },
    logoWA: {
      maxHeight: theme.spacing(4)
    },
    fullWidth: {
      width: '100%'
    }
  })
);

function LoginForm() {
  const classes = useStyles();
  const auth = useAuth();
  const { t } = useTranslation();

  const [logging, setLogging] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleChangeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };
  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  if (auth?.user) {
    return <Redirect push to="/search" />;
  }

  const formHandle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLogging(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    fetch('/api/login', {
      method: 'POST',
      body: formData
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error();
      })
      .then((response) => {
        setLogging(false);
        setUsername('');
        setPassword('');
        auth?.signIn(response);
        addNotification(t('login.header'), t('login.success'), 'success');
      })
      .catch(() => {
        setLogging(false);
        addNotification(t('login.header'), t('login.error'), 'danger');
      });
  };

  return (
    <>
      <Grid container className={classes.root} justifyContent="center">
        <Grid item xl={2} lg={3} md={4} sm={6} xs={12}>
          {logging && <Spinner />}
          {/*{!logging && (*/}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Link href="https://www.webarchiv.cz/" target="_blank">
                <img src={logoWebArchive} alt="Logo Webarchiv" className={classes.logoWA} />
              </Link>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h1">{t<string>('login.header')}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  {t<string>('login.text')}
                </Typography>
              </Box>
            </Grid>

            <form onSubmit={formHandle} className={classes.fullWidth}>
              <Box mb={2}>
                <TextField
                  label={t<string>('login.name')}
                  variant="outlined"
                  autoFocus
                  value={username}
                  onChange={handleChangeUsername}
                  className={classes.fullWidth}
                />
              </Box>

              <Box mb={2}>
                <TextField
                  label={t<string>('login.password')}
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={handleChangePassword}
                  className={classes.fullWidth}
                />
              </Box>

              <Box mt={2}>
                <Button variant="contained" type="submit" color="primary" size="large">
                  {t<string>('login.button')}
                </Button>
              </Box>
            </form>
          </Grid>
          {/*)}*/}
        </Grid>
      </Grid>

      <Grid container className={classes.root} justifyContent="center">
        <Grid item xl={4} lg={6} md={12} sm={12} xs={12}>
          <Box mt={8}>
            <Typography variant="body2" color="textSecondary">
              {t<string>('login.textBottom')}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default LoginForm;
