import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Card,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Button,
  Typography
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import Visibility from '@material-ui/icons/Visibility';
import StarIcon from '@material-ui/icons/Star';
import ReplayIcon from '@material-ui/icons/Replay';
import GetAppIcon from '@material-ui/icons/GetApp';
import { useHistory } from 'react-router-dom';
import StarBorderIcon from '@material-ui/icons/StarBorder';

import ActionsMenu, { MenuAction } from '../components/ActionsMenu';
import { addNotification } from '../config/notifications';
import ISearch from '../interfaces/ISearch';
import { DialogContext } from '../components/dialog/Dialog.context';
import QueryDetailDialog from '../components/dialog/QueryDetailDialog';
import AddToFavoriteDialog from '../components/dialog/AddToFavoriteDialog';
import { SearchContext } from '../components/Search.context';
import { Types } from '../components/reducers';

export const HistoryForm = () => {
  const { t, i18n } = useTranslation();
  const history = useHistory();

  const { state, dispatch } = useContext(SearchContext);

  const [queries, setQueries] = useState<ISearch[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const dialog = useContext(DialogContext);

  const actions = useCallback(
    (r: ISearch) =>
      (
        [
          {
            icon: <Visibility color="primary" />,
            title: t('query.buttons.detail'),
            onClick: () => {
              console.log(r);
              dialog.open({
                size: 'lg',
                content: QueryDetailDialog,
                values: r
              });
            }
          },
          {
            icon: r.favorite ? <StarBorderIcon color="primary" /> : <StarIcon color="primary" />,
            title: r.favorite
              ? t('query.buttons.removeFromFavorites')
              : t('query.buttons.addToFavorites'),
            onClick: () => {
              r.favorite
                ? fetch(`/api/search/favorite/${r.id}`, {
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
                    })
                : dialog.open({
                    size: 'sm',
                    content: AddToFavoriteDialog,
                    values: r
                  });
            }
          },
          {
            icon: <ReplayIcon color="primary" />,
            title: t('query.buttons.repeat'),
            onClick: () => {
              dispatch({
                type: Types.SetState,
                payload: {
                  ...state,
                  query: r.filter,
                  entriesLimit: r.entries,
                  seed: r.randomSeed,
                  harvests: r.harvests,
                  stopWords: r.stopWords,
                  queries: r.queries.map((q) => ({
                    searchType: q.type,
                    // searchText: q.,
                    queries: q.expressions,
                    queriesOpposite: q.expressionsOpposite,
                    // query: q.,
                    context: q.contextSize ? true : false,
                    useOnlyDomains: q.useOnlyDomains,
                    useOnlyDomainsOpposite: q.useOnlyDomainsOpposite,
                    contextSize: q.contextSize,
                    limit: q.limit
                  }))
                }
              });
              history.push('/search');
            }
          },
          !['STOPPED'].includes(r.state)
            ? {
                icon: !['DONE', 'ERROR'].includes(r.state) ? (
                  <CircularProgress size={15} />
                ) : (
                  <GetAppIcon color="primary" />
                ),
                title: t('query.buttons.download'),
                onClick: () =>
                  ['DONE'].includes(r.state) &&
                  fetch('/api/download/' + r.id)
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
                      addNotification(t('query.error.title'), t('query.error.message'), 'danger')
                    )
              }
            : undefined
        ] as MenuAction[]
      ).filter((i) => i !== undefined),
    []
  );

  const stateToString = (state: string) => {
    switch (state) {
      case 'WAITING':
        return t('administration.harvests.states.UNPROCESSED');
      case 'INDEXING':
        return t('process.indexing');
      case 'PROCESSING':
        return t('administration.harvests.states.PROCESSING');
      case 'ERROR':
        return t('administration.harvests.states.ERROR');
      case 'STOPPED':
        return t('administration.harvests.states.STOPPED');
      case 'DONE':
        return t('process.finished');
    }
    return '?';
  };

  const refreshSearches = () => {
    fetch('/api/search')
      .then((res) => res.json())
      .then(
        (result) => {
          setQueries(result);
        },
        () => {
          setQueries([]);
        }
      );
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    refreshSearches();
    const interval = setInterval(refreshSearches, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {queries.filter((v) => !['DONE', 'ERROR', 'STOPPED'].includes(v.state)).length > 0 && (
        <>
          <Typography variant="h1">{t<string>('header.currentQueries')}</Typography>
          <Card variant="outlined">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t<string>('query.header')}</TableCell>
                    <TableCell>{t<string>('query.created')}</TableCell>
                    <TableCell>{t<string>('query.state')}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {queries
                    .filter((v) => !['DONE', 'ERROR', 'STOPPED'].includes(v.state))
                    .map((row) => (
                      <TableRow
                        hover
                        style={{ cursor: 'pointer' }}
                        key={row.id}
                        onClick={() =>
                          dialog.open({
                            size: 'lg',
                            content: QueryDetailDialog,
                            values: row
                          })
                        }>
                        <TableCell>
                          <span aria-label={row.filter}>
                            {row.filter.length > 60
                              ? row.filter.substring(0, 60 - 3) + '...'
                              : row.filter}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(row.createdAt).toLocaleString(i18n.language)}
                        </TableCell>
                        <TableCell>{stateToString(row.state)}</TableCell>
                        <TableCell>
                          <CircularProgress size={15} />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
          <br />
        </>
      )}

      <Typography variant="h1">{t<string>('header.myQueries')}</Typography>
      <Card variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="50px"></TableCell>
                <TableCell>{t<string>('query.header')}</TableCell>
                <TableCell>{t<string>('query.created')}</TableCell>
                <TableCell>{t<string>('query.state')}</TableCell>
                <TableCell width="50px"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queries
                .filter((v) => ['DONE', 'ERROR', 'STOPPED'].includes(v.state))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow
                    hover
                    style={{ cursor: 'pointer' }}
                    key={row.id}
                    onClick={() =>
                      dialog.open({
                        size: 'lg',
                        content: QueryDetailDialog,
                        values: row
                      })
                    }>
                    <TableCell
                      onClick={(e) => {
                        e.stopPropagation();
                      }}>
                      {row.favorite ? (
                        <Button
                          key="removeFromFavorite"
                          variant="text"
                          color={'default'}
                          size="medium"
                          onClick={() => {
                            fetch(`/api/search/favorite/${row.id}`, {
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
                                  t(
                                    'administration.users.notifications.removeFovriteError',
                                    'danger'
                                  )
                                );
                              });
                          }}>
                          <StarIcon color="primary" />
                        </Button>
                      ) : (
                        <Button
                          key="addToFavorite"
                          variant="text"
                          color={'default'}
                          size="medium"
                          onClick={() => {
                            dialog.open({
                              size: 'sm',
                              content: AddToFavoriteDialog,
                              values: {
                                id: row.id
                              }
                            });
                          }}>
                          <StarBorderIcon color="primary" />
                        </Button>
                      )}
                    </TableCell>

                    <TableCell>
                      <span aria-label={row.filter}>
                        {row.filter.length > 60
                          ? row.filter.substring(0, 60 - 3) + '...'
                          : row.filter}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(row.createdAt).toLocaleString(i18n.language)}</TableCell>
                    <TableCell>{stateToString(row.state)}</TableCell>
                    <TableCell
                      onClick={(e) => {
                        e.stopPropagation();
                      }}>
                      <ActionsMenu actions={actions?.(row) ?? []} hideEmpty />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={queries.filter((v) => ['DONE', 'ERROR', 'STOPPED'].includes(v.state)).length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t<string>('pagination.rowsPerPage')}
          labelDisplayedRows={({ from, to, count }) => {
            return '' + from + '-' + to + ' ' + t('pagination.from') + ' ' + count;
          }}
        />
      </Card>
    </>
  );
};
