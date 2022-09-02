import React from 'react';
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
  Button,
  CircularProgress
} from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import StarIcon from '@material-ui/icons/Star';
import CloseIcon from '@material-ui/icons/Close';
import ReplayIcon from '@material-ui/icons/Replay';

import ISearch from '../../interfaces/ISearch';
import { addNotification } from '../../config/notifications';
import ProcessStatus from '../ProcessStatus';

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

const QueryDetailDialog = ({
  onClose,
  values: { id, filter, queries, state }
}: DialogContentProps<ISearch>) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const handleDownload = () => {
    ['DONE'].includes(state) &&
      fetch('/api/download/' + id).then((response) =>
        response
          .blob()
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'results.zip';
            document.body.appendChild(a);
            a.click();
            a.remove();
            addNotification(t('query.success.title'), t('query.success.message'), 'success');
          })
          .catch(() => addNotification(t('query.error.title'), t('query.error.message'), 'danger'))
      );
  };

  return (
    <Grid container spacing={2} className={classes.dialog}>
      <Grid item xs={12} justifyContent="space-between">
        {/* TODO: display name instead of header, if query is favorite */}
        <Typography variant="h2">{t<string>('query.header')}</Typography>
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Grid>
      <Grid item xs={12}>
        <TextField multiline rows={3} variant="outlined" fullWidth value={filter} disabled />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h2">{t<string>('analytics.title')}</Typography>
      </Grid>
      <Grid item xs={12}>
        {queries &&
          queries?.map((query, index) => (
            <Box my={2} key={index}>
              <Paper>
                <Box p={2}>
                  <Grid container spacing={2} key={index}>
                    <Grid item md={2} xs={12}>
                      <TextField
                        select
                        label={t<string>('analytics.queryType')}
                        fullWidth
                        value={query.type}
                        disabled>
                        <MenuItem value="FREQUENCY">Frequency</MenuItem>
                        <MenuItem value="COLLOCATION">Colocation</MenuItem>
                        {/*<MenuItem value="OCCURENCE">Occurence</MenuItem>*/}
                        <MenuItem value="RAW">Raw</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item md={4} xs={12}>
                      <Grid container spacing={2}>
                        {query.type === 'COLLOCATION' && (
                          <>
                            {query?.contextSize && (
                              <Grid item xs={6}>
                                <TextField
                                  type="number"
                                  fullWidth
                                  label={t<string>('analytics.contextLength')}
                                  value={query.contextSize}
                                  disabled
                                />
                              </Grid>
                            )}
                            <Grid item xs={6}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    color="primary"
                                    checked={query?.contextSize ? true : false}
                                    disabled
                                  />
                                }
                                label={t<string>('analytics.context')}
                              />
                            </Grid>
                          </>
                        )}

                        {(query.type === 'RAW' || query.type === 'FREQUENCY') && (
                          <>
                            <Grid item xs={6}>
                              <TextField
                                type="number"
                                label={t<string>('filters.entriesLimit')}
                                fullWidth
                                value={query.limit}
                                inputProps={{ min: 1, max: 1000 }}
                                disabled
                              />
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Grid>
                    {query.expressions.length > 0 && (
                      <Box className={classes.words}>
                        <Typography variant="body1">{t<string>('analytics.words')}</Typography>
                        <Box component="ul" className={classes.chipRoot}>
                          {query.expressions?.map((q, ind) => (
                            <li key={ind}>
                              <Chip label={q} className={classes.chip} />
                            </li>
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Grid
                      item
                      xs={12}
                      md={1}
                      justify="flex-end"
                      style={{ textAlign: 'right', paddingRight: '2rem' }}></Grid>
                  </Grid>
                </Box>
              </Paper>
            </Box>
          ))}
      </Grid>
      <ProcessStatus state={state} />
      <Grid item xs={12}>
        <Grid container justifyContent="flex-start" spacing={2}>
          <Grid item>
            <Button
              key="download"
              variant="contained"
              color={'primary'}
              disabled={!['DONE', 'ERROR'].includes(state)}
              size="medium"
              onClick={handleDownload}>
              <>
                {!['DONE', 'ERROR'].includes(state) ? (
                  <CircularProgress size={15} />
                ) : (
                  <GetAppIcon className={classes.icon} />
                )}
                {t<string>('query.buttons.download')}
              </>
            </Button>
          </Grid>
          <Grid item>
            <Button key="favourite" variant="text" color={'default'} size="medium">
              <>
                <StarIcon className={classes.icon} color="primary" />
                {/* TODO: add option to remove from favourites */}
                <span style={{ color: '#0000ff' }}>
                  {t<string>('query.buttons.addToFavorites')}
                </span>
              </>
            </Button>
          </Grid>
          <Grid item className={classes.repeat}>
            <Button
              key="repeat"
              variant="outlined"
              color={'primary'}
              size="medium"
              // onClick={handleSearch}
            >
              <>
                <ReplayIcon className={classes.icon} color="primary" />
                {t<string>('query.buttons.repeat')}
              </>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default QueryDetailDialog;
