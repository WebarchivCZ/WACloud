import React, { useContext } from 'react';
import {
  Grid,
  makeStyles,
  MenuItem,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Paper,
  Box,
  Button,
  Chip
} from '@material-ui/core';
import _ from 'lodash';
import AddIcon from '@material-ui/icons/Add';
import { useTranslation } from 'react-i18next';

import IQuery from '../interfaces/IQuery';
import { SearchContext } from '../components/Search.context';
import { Types } from '../components/reducers';

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
  }
}));

//enum QueryType {Frequency, Colocation, Occurence}

function AnalyticQueriesForm({
  queries,
  setQueries
}: {
  queries: IQuery[];
  setQueries: (queries: IQuery[]) => void;
}) {
  const { t } = useTranslation();
  const classes = useStyles();

  const { state, dispatch } = useContext(SearchContext);

  const handleQueryTypeChange = (index: number, event: React.ChangeEvent<{ value: unknown }>) => {
    const q: IQuery[] = _.cloneDeep(state.queries);
    q[index].searchType = event.target.value as string;
    setQueries(q);
    dispatch({ type: Types.SetQueries, payload: { queries: q } });
  };

  const handleChangeSearchText = (index: number, event: React.ChangeEvent<{ value: unknown }>) => {
    const q: IQuery[] = _.cloneDeep(state.queries);
    q[index].searchText = event.target.value as string;
    setQueries(q);
    dispatch({ type: Types.SetQueries, payload: { queries: q } });
  };

  const handleChangeSearchTextOpposite = (
    index: number,
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const q: IQuery[] = _.cloneDeep(queries);
    q[index].searchTextOpposite = event.target.value as string;
    setQueries(q);
    dispatch({ type: Types.SetQueries, payload: { queries: q } });
  };

  const handleChangeContext = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const q: IQuery[] = _.cloneDeep(state.queries);
    q[index].context = event.target.checked as boolean;
    setQueries(q);
    dispatch({ type: Types.SetQueries, payload: { queries: q } });
  };

  const handleChangeUseOnlyDomains = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const q: IQuery[] = _.cloneDeep(queries);
    q[index].useOnlyDomains = event.target.checked as boolean;
    setQueries(q);
    dispatch({ type: Types.SetQueries, payload: { queries: q } });
  };

  const handleChangeUseOnlyDomainsOpposite = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const q: IQuery[] = _.cloneDeep(queries);
    q[index].useOnlyDomainsOpposite = event.target.checked as boolean;
    setQueries(q);
    dispatch({ type: Types.SetQueries, payload: { queries: q } });
  };

  const handleChangeContextLength = (
    index: number,
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const q: IQuery[] = _.cloneDeep(state.queries);
    q[index].contextSize = event.target.value as number;
    setQueries(q);
    dispatch({ type: Types.SetQueries, payload: { queries: q } });
  };

  const handleChangeLimit = (index: number, event: React.ChangeEvent<{ value: string }>) => {
    const q: IQuery[] = _.cloneDeep(state.queries);
    q[index].limit = parseInt(event.target.value);
    setQueries(q);
    dispatch({ type: Types.SetQueries, payload: { queries: q } });
  };

  const handleDeleteQueryText = (index: number, ind: number) => {
    const q: IQuery[] = _.cloneDeep(state.queries);
    q[index].queries.splice(ind, 1);
    setQueries(q);
    dispatch({ type: Types.SetQueries, payload: { queries: q } });
  };

  const handleDeleteQueryOppositeText = (index: number, ind: number) => {
    const q: IQuery[] = _.cloneDeep(queries);
    q[index].queriesOpposite.splice(ind, 1);
    setQueries(q);
  };

  const handleAddQueryText = (index: number) => {
    if (state.queries[index].searchText.length > 0) {
      const q: IQuery[] = _.cloneDeep(state.queries);
      q[index].queries.push(q[index].searchText);
      q[index].searchText = '';
      setQueries(q);
      dispatch({ type: Types.SetQueries, payload: { queries: q } });
    }
  };

  const handleAddQueryOppositeText = (index: number) => {
    if (queries[index].searchTextOpposite.length > 0) {
      const q: IQuery[] = _.cloneDeep(queries);
      q[index].queriesOpposite.push(q[index].searchTextOpposite);
      q[index].searchTextOpposite = '';
      setQueries(q);
      dispatch({ type: Types.SetQueries, payload: { queries: q } });
    }
  };

  const handleAddQuery = () => {
    const q: IQuery[] = _.cloneDeep(state.queries);
    q.push({
      queries: [],
      queriesOpposite: [],
      query: '',
      context: false,
      searchText: '',
      searchTextOpposite: '',
      searchType: '',
      limit: 10,
      useOnlyDomains: false,
      useOnlyDomainsOpposite: false
    });
    setQueries(q);
    dispatch({ type: Types.SetQueries, payload: { queries: q } });
  };

  const handleDeleteQuery = (index: number) => {
    const q: IQuery[] = _.cloneDeep(state.queries);
    q.splice(index, 1);
    setQueries(q);
    dispatch({ type: Types.SetQueries, payload: { queries: q } });
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="h2">{t<string>('analytics.title')}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button variant="contained" size="large" color="primary" onClick={handleAddQuery}>
                {t<string>('analytics.add')}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {state.queries.map((query, index) => (
        <Box my={2} key={index}>
          <Paper>
            <Box p={2}>
              <Grid container spacing={2} key={index}>
                <Grid item md={2} xs={12}>
                  <TextField
                    select
                    label={t<string>('analytics.queryType')}
                    fullWidth
                    value={query.searchType}
                    onChange={(event) => handleQueryTypeChange(index, event)}>
                    <MenuItem value="FREQUENCY">Frequency</MenuItem>
                    <MenuItem value="COLLOCATION">Colocation</MenuItem>
                    {/*<MenuItem value="OCCURENCE">Occurence</MenuItem>*/}
                    <MenuItem value="NETWORK">Network</MenuItem>
                    <MenuItem value="RAW">Raw</MenuItem>
                  </TextField>
                </Grid>

                {query.searchType !== 'NETWORK' && (
                  <>
                    <Grid item md={4} xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label={t<string>('analytics.wordInput')}
                            value={query.searchText}
                            onChange={(event) => handleChangeSearchText(index, event)}
                            onKeyDown={(event) => {
                              if (event.keyCode === 13) handleAddQueryText(index);
                            }}
                          />
                        </Grid>

                        {query.searchType === 'COLLOCATION' && (
                          <>
                            <Grid item xs={6}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    color="primary"
                                    checked={query.context}
                                    onChange={(event) => handleChangeContext(index, event)}
                                  />
                                }
                                label={t<string>('analytics.context')}
                              />
                            </Grid>

                            {query.context && (
                              <Grid item xs={6}>
                                <TextField
                                  type="number"
                                  fullWidth
                                  label={t<string>('analytics.contextLength')}
                                  value={query.contextSize}
                                  onChange={(event) => handleChangeContextLength(index, event)}
                                />
                              </Grid>
                            )}
                          </>
                        )}

                        {(query.searchType === 'RAW' || query.searchType === 'FREQUENCY') && (
                          <>
                            <Grid item xs={6}>
                              <TextField
                                type="number"
                                label={t<string>('filters.entriesLimit')}
                                fullWidth
                                value={query.limit}
                                inputProps={{ min: 1, max: 1000 }}
                                onChange={(event) => handleChangeLimit(index, event)}
                              />
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={1}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          handleAddQueryText(index);
                        }}
                        style={{
                          width: '40px',
                          height: '40px',
                          margin: '0px',
                          padding: '0px',
                          minWidth: '40px'
                        }}>
                        <AddIcon fontSize="small" />
                      </Button>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Typography variant="body1">{t<string>('analytics.words')}</Typography>
                      <Box component="ul" className={classes.chipRoot}>
                        {query.queries.map((q, ind) => (
                          <li key={ind}>
                            <Chip
                              label={q}
                              onDelete={() => handleDeleteQueryText(index, ind)}
                              className={classes.chip}
                            />
                          </li>
                        ))}
                      </Box>
                    </Grid>
                  </>
                )}

                {query.searchType === 'NETWORK' && (
                  <>
                    <Grid item xs={12} md={9}>
                      <Grid container spacing={2}>
                        <Grid item xs={5} md={5}>
                          <TextField
                            fullWidth
                            label={t<string>('analytics.inputNodes')}
                            value={query.searchText}
                            onChange={(event) => handleChangeSearchText(index, event)}
                            onKeyDown={(event) => {
                              if (event.keyCode === 13) handleAddQueryText(index);
                            }}
                          />
                        </Grid>

                        <Grid item xs={2} md={2}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              handleAddQueryText(index);
                            }}
                            style={{
                              width: '40px',
                              height: '40px',
                              margin: '0px',
                              padding: '0px',
                              minWidth: '40px'
                            }}>
                            <AddIcon fontSize="small" />
                          </Button>
                        </Grid>

                        <Grid item xs={5} md={5}>
                          <Typography variant="body1">
                            {t<string>('analytics.inputNodes')}
                          </Typography>
                          <Box component="ul" className={classes.chipRoot}>
                            {query.queries.map((q, ind) => (
                              <li key={ind}>
                                <Chip
                                  label={q}
                                  onDelete={() => handleDeleteQueryText(index, ind)}
                                  className={classes.chip}
                                />
                              </li>
                            ))}
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                color="primary"
                                checked={query.useOnlyDomains}
                                onChange={(event) => handleChangeUseOnlyDomains(index, event)}
                              />
                            }
                            label={t<string>('analytics.useDomainsOnly')}
                          />
                        </Grid>

                        <Grid item xs={5} md={5}>
                          <TextField
                            fullWidth
                            label={t<string>('analytics.outputNodes')}
                            value={query.searchTextOpposite}
                            onChange={(event) => handleChangeSearchTextOpposite(index, event)}
                            onKeyDown={(event) => {
                              if (event.keyCode === 13) handleAddQueryOppositeText(index);
                            }}
                          />
                        </Grid>

                        <Grid item xs={2} md={2}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              handleAddQueryOppositeText(index);
                            }}
                            style={{
                              width: '40px',
                              height: '40px',
                              margin: '0px',
                              padding: '0px',
                              minWidth: '40px'
                            }}>
                            <AddIcon fontSize="small" />
                          </Button>
                        </Grid>

                        <Grid item xs={5} md={5}>
                          <Typography variant="body1">
                            {t<string>('analytics.outputNodes')}
                          </Typography>
                          <Box component="ul" className={classes.chipRoot}>
                            {query.queriesOpposite.map((q, ind) => (
                              <li key={ind}>
                                <Chip
                                  label={q}
                                  onDelete={() => handleDeleteQueryOppositeText(index, ind)}
                                  className={classes.chip}
                                />
                              </li>
                            ))}
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                color="primary"
                                checked={query.useOnlyDomainsOpposite}
                                onChange={(event) =>
                                  handleChangeUseOnlyDomainsOpposite(index, event)
                                }
                              />
                            }
                            label={t<string>('analytics.useDomainsOnly')}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </>
                )}

                <Grid
                  item
                  xs={12}
                  md={1}
                  justify="flex-end"
                  style={{ textAlign: 'right', paddingRight: '2rem' }}>
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => handleDeleteQuery(index)}>
                    {t<string>('analytics.delete')}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      ))}
    </>
  );
}

export default AnalyticQueriesForm;
