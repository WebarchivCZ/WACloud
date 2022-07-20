import { Box, Typography, Grid, Paper, makeStyles } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchState } from '../interfaces/ISearch';

type Props = {
  state: SearchState;
};

const useStyles = makeStyles(() => ({
  textBold: {
    fontWeight: 'bold'
  },
  line: {
    width: 100,
    height: 1,
    backgroundColor: '#DADADA'
  }
}));

const ProcessStatus: FC<Props> = ({ state }) => {
  const { t } = useTranslation();

  const classes = useStyles();

  return (
    <Grid item xs={12}>
      <Typography variant="h2">{t<string>('process.state')}</Typography>
      <Box my={2}>
        <Paper>
          <Box px={2} py={4} display="flex">
            <Box display="flex" alignItems="center">
              <Box
                mx={2}
                width={40}
                height={40}
                bgcolor={
                  state === 'INDEXING' || state === 'DONE' || state === 'PROCESSING'
                    ? 'primary.main'
                    : '#757575'
                }
                color="white"
                display="flex"
                justifyContent="center"
                alignItems="center">
                <Typography className={classes.textBold}>1</Typography>
              </Box>
              <Box>
                <Typography className={classes.textBold}>
                  {t<string>('process.indexing')}
                </Typography>
                <Typography>
                  {state === 'WAITING'
                    ? 'Čeká se'
                    : state === 'INDEXING'
                    ? 'Probíhá'
                    : state === 'ERROR'
                    ? 'Chyba'
                    : '100%'}
                </Typography>
              </Box>
              <Box mx={2} className={classes.line} />
            </Box>
            <Box display="flex" alignItems="center">
              <Box
                mx={2}
                width={40}
                height={40}
                bgcolor={state === 'PROCESSING' || state === 'DONE' ? 'primary.main' : '#757575'}
                color="white"
                display="flex"
                justifyContent="center"
                alignItems="center">
                <Typography className={classes.textBold}>2</Typography>
              </Box>
              <Box>
                <Typography className={classes.textBold}>Statistické dotazy</Typography>
                <Typography>
                  {state === 'WAITING' || state === 'INDEXING'
                    ? 'Čeká se'
                    : state === 'PROCESSING'
                    ? 'Probíhá'
                    : state === 'ERROR'
                    ? 'Chyba'
                    : '100%'}
                </Typography>
              </Box>
              <Box mx={2} className={classes.line} />
            </Box>
            <Box display="flex" alignItems="center">
              <Box
                mx={2}
                width={40}
                height={40}
                bgcolor={state === 'DONE' ? 'primary.main' : '#757575'}
                color="white"
                display="flex"
                justifyContent="center"
                alignItems="center">
                <Typography className={classes.textBold}>3</Typography>
              </Box>
              <Box>
                <Typography className={classes.textBold}>Hotovo</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Grid>
  );
};

export default ProcessStatus;
