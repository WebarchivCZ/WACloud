import React, {FunctionComponent, ReactElement} from 'react';
import {
  AppBar,
  makeStyles,
  Theme,
  createStyles,
  Toolbar
} from '@material-ui/core';
import HeaderLogos from "../components/HeaderLogos";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
    toolbar: {
      padding: theme.spacing(0, 5, 0, 2),
      fontWeight: 700,
      fontSize: '1rem',
      '& > a': {
        marginRight: theme.spacing(5),
        textDecoration: 'underline',
        color: '#000000'
      },
      '& > a:hover': {
        color: '#0000ff'
      },
      '& > a.active': {
        color: '#0000ff'
      },
    },
    toolbarContent: {
      ...theme.mixins.toolbar,
    },
  }),
);

type HeaderProps = {
  toolbar: ReactElement<any, any>,
  drawer?: ReactElement<any, any>
}

export const Header: FunctionComponent<HeaderProps> = ({ toolbar, drawer, children }) => {
  const classes = useStyles();

  return (
    <>
      <div className={classes.root}>
        <AppBar
          position="fixed"
          color="default"
          className={classes.appBar}
        >
          <Toolbar className={classes.toolbar}>
            <HeaderLogos/>
            {toolbar}
          </Toolbar>
        </AppBar>

        {drawer}

        <main className={classes.content}>
          <div className={classes.toolbarContent} />
          {children}
        </main>
      </div>
    </>
  );
}
