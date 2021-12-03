import {createStyles, Link, makeStyles, Theme} from "@material-ui/core";
import logoNk from "../images/nk-logo.svg";
import logoWebArchive from "../images/webarchiv-logo.svg";
import React from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1,
    },
    logoNK: {
      '& > img': {
        maxHeight: theme.spacing(3),
      },
      margin: '0 !important'
    },
    logoWA: {
      '& > img': {
        maxHeight: theme.spacing(3),
        marginLeft: theme.spacing(2),
      },
      margin: '0 !important'
    },
  }),
);

function HeaderLogos() {
  const classes = useStyles();

  return (
    <>
      <Link href="http://www.nkp.cz/" target="_blank" className={classes.logoNK}>
        <img src={logoNk} alt="Logo National Library" />
      </Link>
      <Link href="https://www.webarchiv.cz/" target="_blank" className={classes.logoWA}>
        <img src={logoWebArchive} alt="Logo Webarchiv" />
      </Link>
      <div className={classes.grow} />
    </>
  )
}

export default HeaderLogos;