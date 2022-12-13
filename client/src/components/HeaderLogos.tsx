import { createStyles, Link, makeStyles, Theme } from '@material-ui/core';
import React from 'react';
import HomeIcon from '@material-ui/icons/Home';
import { Link as LinkRouter } from 'react-router-dom';

import logoNk from '../images/nk-logo.svg';
import logoWebArchive from '../images/webarchiv-logo.svg';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1
    },
    home: {
      margin: '0 1rem !important',
      cursor: 'pointer'
    },
    logoNK: {
      '& > img': {
        maxHeight: theme.spacing(3)
      },
      margin: '0 !important'
    },
    logoWA: {
      '& > img': {
        maxHeight: theme.spacing(3),
        marginLeft: theme.spacing(2)
      },
      margin: '0 !important'
    }
  })
);

function HeaderLogos() {
  const classes = useStyles();

  return (
    <>
      <LinkRouter to="/" className={classes.home}>
        <HomeIcon />
      </LinkRouter>
      <Link href="http://www.nkp.cz/" target="_blank" className={classes.logoNK}>
        <img src={logoNk} alt="Logo National Library" />
      </Link>
      <Link href="https://www.webarchiv.cz/" target="_blank" className={classes.logoWA}>
        <img src={logoWebArchive} alt="Logo Webarchiv" />
      </Link>
      <div className={classes.grow} />
    </>
  );
}

export default HeaderLogos;
