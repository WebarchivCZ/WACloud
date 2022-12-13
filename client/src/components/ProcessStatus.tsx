import { Box, Typography, Grid, Paper, makeStyles } from '@material-ui/core';
import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@material-ui/icons/Check';

import { SearchState } from '../interfaces/ISearch';

import { SearchContext } from './Search.context';

type Props = {
  state?: SearchState;
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

  const { state: contextState } = useContext(SearchContext);

  const currentSearchState = state ? state : contextState.searchState;

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
                  currentSearchState == 'INDEXING' ||
                  currentSearchState == 'DONE' ||
                  currentSearchState == 'PROCESSING'
                    ? 'primary.main'
                    : '#757575'
                }
                color="white"
                display="flex"
                justifyContent="center"
                alignItems="center">
                {currentSearchState == 'PROCESSING' || currentSearchState == 'DONE' ? (
                  <CheckIcon />
                ) : (
                  <Typography className={classes.textBold}>1</Typography>
                )}
              </Box>
              <Box>
                <Typography className={classes.textBold}>
                  {t<string>('process.indexing')}
                </Typography>
                <Typography>
                  {currentSearchState == 'WAITING'
                    ? t<string>('process.waiting')
                    : currentSearchState == 'INDEXING'
                    ? t<string>('process.processing')
                    : currentSearchState == 'ERROR'
                    ? t<string>('process.error')
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
                bgcolor={
                  currentSearchState == 'PROCESSING' || currentSearchState == 'DONE'
                    ? 'primary.main'
                    : '#757575'
                }
                color="white"
                display="flex"
                justifyContent="center"
                alignItems="center">
                {currentSearchState == 'DONE' ? (
                  <CheckIcon />
                ) : (
                  <Typography className={classes.textBold}>2</Typography>
                )}
              </Box>
              <Box>
                <Typography className={classes.textBold}>
                  {t<string>('process.statisticalQueries')}
                </Typography>
                <Typography>
                  {currentSearchState == 'WAITING' || currentSearchState == 'INDEXING'
                    ? t<string>('process.waiting')
                    : currentSearchState == 'PROCESSING'
                    ? t<string>('process.processing')
                    : currentSearchState == 'ERROR'
                    ? t<string>('process.error')
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
                bgcolor={currentSearchState == 'DONE' ? 'primary.main' : '#757575'}
                color="white"
                display="flex"
                justifyContent="center"
                alignItems="center">
                {currentSearchState == 'DONE' ? (
                  <CheckIcon />
                ) : (
                  <Typography className={classes.textBold}>3</Typography>
                )}
              </Box>
              <Box>
                <Typography className={classes.textBold}>
                  {t<string>('process.finished')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Grid>
  );
};

export default ProcessStatus;
