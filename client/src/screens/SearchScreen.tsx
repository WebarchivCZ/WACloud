import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Box, Button, Divider, Grid, CircularProgress, makeStyles } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';

import { Header } from '../components/Header';
import { UserMenu } from '../components/UserMenu';
import { FiltersDrawer } from '../components/FiltersDrawer';
import { QueryForm } from '../forms/QueryForm';
import stopWordsCzech from '../config/stopWords';
import { addNotification } from '../config/notifications';
import AnalyticQueriesForm from '../forms/AnalyticQueriesForm';
import IQuery from '../interfaces/IQuery';
import { HarvestsForm } from '../forms/HarvestsForm';
import { BlackButton } from '../components/BlackButton';
import ProcessStatus from '../components/ProcessStatus';
import { SearchContext } from '../components/Search.context';
import { Types } from '../components/reducers';
import AddToFavoriteDialog from '../components/dialog/AddToFavoriteDialog';
import { DialogContext } from '../components/dialog/Dialog.context';

enum Stage {
  QUERY,
  ANALYTICS,
  PROCESS
}

const useStyles = makeStyles(() => ({
  icon: {
    marginRight: '1rem'
  }
}));

const SearchScreen = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { state, dispatch } = useContext(SearchContext);
  const dialog = useContext(DialogContext);

  const [query, setQuery] = useState<string>('');
  const [stopWords, setStopWords] = useState<string[]>(stopWordsCzech.sort());

  const [queries, setQueries] = useState<IQuery[]>([
    {
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
    }
  ]);

  const refreshSearchState = (id: number) => {
    fetch(`/api/search/${id}`)
      .then((res) => res.json())
      .then((data) => {
        dispatch({ type: Types.SetState, payload: { ...state, searchState: data.state } });
      });
  };

  const handleSearch = () => {
    addNotification(t('query.start.title'), t('query.start.message'), 'info');
    fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        base: {
          filter: state.query.length === 0 ? '*:*' : state.query,
          harvests: state.harvests,
          entries: state.entriesLimit,
          stopWords: state.stopWords.map((v) => v.trim()),
          randomSeed: state.seed
        },
        queries: state.queries.map(function (x) {
          return {
            type: x.searchType,
            texts: x.queries,
            textsOpposite: x.queriesOpposite,
            contextSize: x.context ? x.contextSize : 0,
            limit: x.limit,
            useOnlyDomains: x.useOnlyDomains,
            useOnlyDomainsOpposite: x.useOnlyDomainsOpposite
          };
        })
      })
    })
      .then((res) => res.json())
      .then((data) => {
        dispatch({
          type: Types.SetState,
          payload: { ...state, stage: Stage.PROCESS, queryId: data.id }
        });
      });
    return;
  };

  const handleSearchStop = () => {
    fetch(`/api/search/${state.queryId}/stop`, {
      method: 'POST'
    })
      .then((res) => res.json())
      .then((data) => {
        dispatch({
          type: Types.SetState,
          payload: {
            ...state,
            searchState: data.state
          }
        });
        addNotification(
          t('header.query'),
          t('administration.users.notifications.stopQuerySuccess'),
          'success'
        );
      })
      .catch(() =>
        addNotification(
          t('header.query'),
          t('administration.users.notifications.stopQueryError'),
          'danger'
        )
      );
  };

  useEffect(() => {
    if (state.stage === Stage.PROCESS && state.queryId) {
      refreshSearchState(state.queryId);
      const interval = setInterval(() => {
        refreshSearchState(state.queryId ?? 0);
        if (
          state.searchState === 'DONE' ||
          state.searchState === 'STOPPED' ||
          state.searchState === 'ERROR'
        ) {
          clearInterval(interval);
        }
      }, 2000);
      if (
        state.searchState === 'DONE' ||
        state.searchState === 'STOPPED' ||
        state.searchState === 'ERROR'
      ) {
        clearInterval(interval);
      }
      return () => {
        clearInterval(interval);
      };
    }
  }, [state.stage, state.searchState, state.queryId]);

  const stages = [
    {
      state: Stage.QUERY,
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <QueryForm value={state.query} setValue={setQuery} />
          </Grid>
          <Grid item xs={12}>
            <HarvestsForm minimal={false} />
          </Grid>
          <Grid item xs={12}>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  onClick={() => {
                    dispatch({
                      type: Types.SetState,
                      payload: { ...state, drawerOpen: false, stage: Stage.ANALYTICS }
                    });
                  }}>
                  {t<string>('query.continue')}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )
    },
    {
      state: Stage.ANALYTICS,
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <QueryForm value={state.query} setValue={setQuery} disabled={true} />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} justifyContent="space-between">
              <Grid item>
                <HarvestsForm minimal={true} />
              </Grid>
              <Grid item>
                <BlackButton
                  variant="contained"
                  size="large"
                  onClick={() => {
                    dispatch({
                      type: Types.SetState,
                      payload: { ...state, drawerOpen: true, stage: Stage.QUERY }
                    });
                  }}>
                  {t<string>('query.edit')}
                </BlackButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <AnalyticQueriesForm queries={state.queries} setQueries={setQueries} />
          </Grid>
          {queries.length > 0 && (
            <>
              <Divider />
              <Box m={2}>
                <Button variant="contained" size="large" color="primary" onClick={handleSearch}>
                  {t<string>('query.search')}
                </Button>
              </Box>
            </>
          )}
          {state.stage === Stage.PROCESS && <ProcessStatus state={state.searchState} />}
        </Grid>
      )
    },
    {
      state: Stage.PROCESS,
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <QueryForm value={state.query} setValue={setQuery} disabled={true} />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} justifyContent="space-between">
              <Grid item>
                <HarvestsForm minimal={true} />
              </Grid>
              <Grid item>
                <BlackButton
                  variant="contained"
                  size="large"
                  onClick={() => {
                    dispatch({
                      type: Types.SetState,
                      payload: { ...state, stage: Stage.QUERY, drawerOpen: true }
                    });
                  }}>
                  {t<string>('query.edit')}
                </BlackButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <AnalyticQueriesForm queries={queries} setQueries={setQueries} />
          </Grid>

          <ProcessStatus state={state.searchState} />
          {state.queries.length > 0 && state.searchState !== 'DONE' && (
            <>
              <Divider />
              <Box m={2}>
                <BlackButton
                  variant="contained"
                  size="large"
                  color="primary"
                  onClick={() => state.searchState !== 'STOPPED' && handleSearchStop()}>
                  {state.searchState === 'STOPPED'
                    ? t<string>('administration.harvests.states.STOPPED')
                    : t<string>('process.stop')}
                </BlackButton>
              </Box>
            </>
          )}
          {state.queries.length > 0 && state.searchState === 'DONE' && (
            <>
              <Divider />
              <Grid item xs={12}>
                <Grid container justifyContent="flex-start" spacing={2}>
                  <Grid item>
                    <Button
                      variant="contained"
                      size="medium"
                      color="primary"
                      onClick={() =>
                        ['DONE'].includes(state.searchState) &&
                        fetch('/api/download/' + state.queryId)
                          .then((response) => response.blob())
                          .then((blob) => {
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'results.zip';
                            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
                            a.click();
                            a.remove(); //afterwards we remove the element again
                            addNotification(
                              t('query.success.title'),
                              t('query.success.message'),
                              'success'
                            );
                          })
                          .catch(() =>
                            addNotification(
                              t('query.error.title'),
                              t('query.error.message'),
                              'danger'
                            )
                          )
                      }>
                      <>
                        {!['DONE', 'ERROR'].includes(state.searchState) ? (
                          <CircularProgress size={15} />
                        ) : (
                          <GetAppIcon className={classes.icon} />
                        )}
                      </>
                      {t<string>('query.buttons.download')}
                    </Button>
                  </Grid>
                  <Grid item>
                    {state?.favorite === true && (
                      <Button
                        key="removeFromFavorite"
                        variant="text"
                        color={'default'}
                        size="medium"
                        onClick={() => {
                          fetch(`/api/search/favorite/${state.queryId}`, {
                            method: 'DELETE'
                          })
                            .then(() => {
                              addNotification(
                                t('header.favorite'),
                                t('administration.users.notifications.removeFavoriteSuccess'),
                                'success'
                              );
                            })
                            .catch(() => {
                              addNotification(
                                t('header.favorite'),
                                t('administration.users.notifications.removeFovriteError', 'danger')
                              );
                            });
                          dispatch({
                            type: Types.SetState,
                            payload: {
                              ...state,
                              favorite: false
                            }
                          });
                        }}>
                        <StarBorderIcon className={classes.icon} color="primary" />
                        <span style={{ color: '#0000ff' }}>
                          {t<string>('query.buttons.removeFromFavorites')}
                        </span>
                      </Button>
                    )}
                    {!state?.favorite && (
                      <>
                        <Button
                          key="addToFavorite"
                          variant="text"
                          color={'default'}
                          size="medium"
                          onClick={() => {
                            // make sure queryId exists
                            state.queryId &&
                              dialog.open({
                                size: 'sm',
                                content: AddToFavoriteDialog,
                                values: {
                                  id: state.queryId
                                },
                                onSubmit: () => {
                                  dispatch({
                                    type: Types.SetState,
                                    payload: {
                                      ...state,
                                      favorite:
                                        state.favorite === undefined ? true : !state.favorite
                                    }
                                  });
                                }
                              });
                          }}>
                          <StarIcon className={classes.icon} color="primary" />
                          <span style={{ color: '#0000ff' }}>
                            {t<string>('query.buttons.addToFavorites')}
                          </span>
                        </Button>
                      </>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      )
    }
  ];

  return (
    <Header
      toolbar={
        <>
          <Link to="/search" style={{ color: '#0000ff' }}>
            {t<string>('header.newQuery')}
          </Link>
          <Link to="/favorite">{t<string>('header.favorite')}</Link>
          <Link to="/history">{t<string>('header.myQueries')}</Link>
          <Link to="/faq">FAQ</Link>
          <UserMenu />
        </>
      }
      drawer={
        <FiltersDrawer
          query={query}
          stopWords={stopWords}
          setStopWords={setStopWords}
          drawerOpen={state.drawerOpen}
          disabled={state.stage !== Stage.QUERY}
        />
      }>
      {stages.filter((s) => s.state === state.stage)[0].content}
    </Header>
  );
};

export default SearchScreen;
