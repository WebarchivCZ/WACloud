import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  IconButton
} from '@material-ui/core';
import PublishIcon from '@material-ui/icons/Publish';
import MoreVertOutlined from '@material-ui/icons/MoreVertOutlined';
import { useTranslation } from 'react-i18next';
import Visibility from '@material-ui/icons/Visibility';
import StarIcon from '@material-ui/icons/Star';
import ReplayIcon from '@material-ui/icons/Replay';
import GetAppIcon from '@material-ui/icons/GetApp';

import ActionsMenu from '../components/ActionsMenu';
import { addNotification } from '../config/notifications';
import ISearch from '../interfaces/ISearch';

export const HistoryForm = () => {
  const { t, i18n } = useTranslation();

  const [queries, setQueries] = useState<ISearch[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const actions = useCallback(
    (r: ISearch) => [
      {
        icon: <Visibility color="primary" />,
        title: t('query.buttons.detail')
      },
      {
        icon: <StarIcon color="primary" />,
        title: t('query.buttons.addToFavorites')
      },
      {
        icon: <ReplayIcon color="primary" />,
        title: t('query.buttons.repeat')
      },
      {
        icon: <GetAppIcon color="primary" />,
        title: t('query.buttons.download')
      }
    ],
    []
  );

  console.log(queries);
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
      {queries.filter((v) => !['DONE', 'ERROR'].includes(v.state)).length > 0 && (
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
                    .filter((v) => !['DONE', 'ERROR'].includes(v.state))
                    .map((row) => (
                      <TableRow hover key={row.id}>
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
                <TableCell>{t<string>('query.header')}</TableCell>
                <TableCell>{t<string>('query.created')}</TableCell>
                <TableCell>{t<string>('query.state')}</TableCell>
                <TableCell></TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {queries
                .filter((v) => ['DONE', 'ERROR'].includes(v.state))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>
                      <span aria-label={row.filter}>
                        {row.filter.length > 60
                          ? row.filter.substring(0, 60 - 3) + '...'
                          : row.filter}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(row.createdAt).toLocaleString(i18n.language)}</TableCell>
                    <TableCell>{stateToString(row.state)}</TableCell>
                    <TableCell>
                      {['DONE'].includes(row.state) && (
                        <Button
                          color="primary"
                          onClick={() => {
                            fetch('/api/download/' + row.id)
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
                              );
                          }}
                          startIcon={<PublishIcon />}>
                          {t<string>('query.buttons.download')}
                        </Button>
                      )}
                      {!['DONE', 'ERROR'].includes(row.state) && <CircularProgress size={15} />}
                    </TableCell>
                    <TableCell>
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
          count={queries.filter((v) => ['DONE', 'ERROR'].includes(v.state)).length}
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
