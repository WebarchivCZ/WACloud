import {Box, Button, createStyles, Grid, Link, makeStyles, TextField, Theme, Typography} from "@material-ui/core";
import logoWebArchive from "../images/webarchiv-logo.svg";
import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {Redirect} from "react-router-dom";
import Spinner from "../components/Spinner";
import {addNotification} from "../config/notifications";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexGrow: 1,
      marginTop: '30px',
      textAlign: "center"
    },
    logoWA: {
      maxHeight: theme.spacing(4)
    },
    fullWidth: {
      width: '100%'
    }
  }),
);

function LoginForm() {
  const classes = useStyles();
  const { t } = useTranslation();

  const [redirect, setRedirect] = useState(false);
  const [logging, setLogging] = useState(false);

  if (redirect) {
    return <Redirect push to="/search" />;
  }

  const formHandle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLogging(true);
    setTimeout(() => {
      setLogging(false);
      setRedirect(true);
      addNotification(t('login.header'), t('login.success'), 'success');
    }, 200);
  }

  return (
    <Grid container className={classes.root} justifyContent="center">
      <Grid item xl={2} lg={3} md={4} sm={6} xs={12}>
        {logging && <Spinner/>}
        {/*{!logging && (*/}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Link href="https://www.webarchiv.cz/" target="_blank">
                <img src={logoWebArchive} alt="Logo Webarchiv"  className={classes.logoWA}/>
              </Link>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h1">
                {t('login.header')}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  {t('login.text')}
                </Typography>
              </Box>
            </Grid>

            <form onSubmit={formHandle}  className={classes.fullWidth}>
              <Box mb={2}>
                <TextField label={t('login.name')} variant="outlined" autoFocus className={classes.fullWidth} />
              </Box>

              <Box mb={2}>
                <TextField label={t('login.password')} type="password" variant="outlined" className={classes.fullWidth} />
              </Box>

              <Box mt={2}>
                <Button variant="contained" type="submit" color="primary" size="large">
                  {t('login.button')}
                </Button>
              </Box>
            </form>
          </Grid>
        {/*)}*/}
      </Grid>
    </Grid>
  );
}

export default LoginForm;