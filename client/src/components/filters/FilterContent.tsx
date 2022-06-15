import {
  Box,
  createStyles,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Theme,
  Typography
} from '@material-ui/core';
import React, { FunctionComponent, ReactElement } from 'react';

type FilterContentProps = {
  title: string;
  icon: ReactElement<any, any>;
  buttons?: ReactElement<any, any>[];
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      minHeight: theme.spacing(8),
      paddingTop: theme.spacing(2)
    },
    buttons: {
      '& button': {
        fontSize: '1.2rem',
        fontWeight: 600
      }
    }
  })
);

export const FilterContent: FunctionComponent<
  FilterContentProps & { children: React.ReactNode }
> = ({ title, icon, children, buttons }) => {
  const classes = useStyles();
  return (
    <ListItem>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText>
        <Typography variant="subtitle2">{title}</Typography>
        <Box className={classes.box}>{children}</Box>
      </ListItemText>
      <ListItemSecondaryAction className={classes.buttons}>
        {buttons &&
          buttons.map((button, index) => (
            <Box m={1} key={index}>
              {button}
            </Box>
          ))}
      </ListItemSecondaryAction>
    </ListItem>
  );
};
