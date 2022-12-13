import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  makeStyles,
  Typography,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button
} from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import CloseIcon from '@material-ui/icons/Close';
import { Cancel } from '@material-ui/icons';

import IWarcArchive from '../../interfaces/IWarcArchive';
import ISearch from '../../interfaces/ISearch';
import { addNotification } from '../../config/notifications';

import { DialogContentProps } from './types';

const useStyles = makeStyles((theme) => ({
  dialog: {
    padding: '2rem',
    overflow: 'auto !important'
  },
  overflow: {
    maxHeight: '220px',
    overflowY: 'scroll'
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1)
  },
  icon: {
    marginRight: '1rem'
  }
}));

const WarcArchivesAdminDialog = ({
  onClose,
  values: { id, warcArchiveState }
}: DialogContentProps<ISearch>) => {
  const { t, i18n } = useTranslation();
  const classes = useStyles();

  const [warcArchives, setWarcArchives] = useState<IWarcArchive[]>([]);
  const [currentState, setCurrentState] = useState<string>(warcArchiveState);

  const handleDownload = (warc: IWarcArchive) => {
    fetch('/api/search/' + id + '/warc/download/' + warc.id).then((response) =>
      response
        .blob()
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = warc.name;
          document.body.appendChild(a);
          a.click();
          a.remove();
          addNotification(t('query.success.title'), t('query.success.message'), 'success');
        })
        .catch(() => addNotification(t('query.error.title'), t('query.error.message'), 'danger'))
    );
  };

  const handleDenyExport = () => {
    fetch(`/api/search/${id}/warc/request`, {
      method: 'DELETE'
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error();
        }
        addNotification(
          t('administration.queries.warc.dialog.title'),
          t('query.success.title'),
          'success'
        );
        refreshArchives();
      })
      .catch(() => {
        addNotification(
          t('administration.queries.warc.dialog.title'),
          t('query.error.title', 'danger'),
          'danger'
        );
      });
  };

  const handleStartExport = () => {
    fetch(`/api/search/${id}/warc`, {
      method: 'POST'
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error();
        }
        addNotification(
          t('administration.queries.warc.dialog.title'),
          t('administration.queries.warc.dialog.generationStarted'),
          'success'
        );
        refreshArchives();
      })
      .catch(() => {
        addNotification(
          t('administration.queries.warc.dialog.title'),
          t('administration.queries.warc.dialog.generationStartFailed', 'danger'),
          'danger'
        );
      });
  };

  const refreshArchives = () => {
    fetch('/api/search/' + id)
      .then((res) => res.json())
      .then(
        (result) => {
          setCurrentState(result.warcArchiveState);
        },
        () => {
          setCurrentState('ERROR');
        }
      );
    fetch('/api/search/' + id + '/warc')
      .then((res) => res.json())
      .then(
        (result) => {
          setWarcArchives(result);
        },
        () => {
          setWarcArchives([]);
        }
      );
  };

  const stateToString = (state: string) => {
    switch (state) {
      case null:
      case 'WAITING':
        return t('administration.queries.warc.dialog.states.WAITING');
      case 'REQUEST':
        return t('administration.queries.warc.dialog.states.REQUEST');
      case 'DENIED':
        return t('administration.queries.warc.dialog.states.DENIED');
      case 'INDEXING':
        return t('administration.queries.warc.dialog.states.INDEXING');
      case 'PROCESSING':
        return t('administration.queries.warc.dialog.states.PROCESSING');
      case 'ERROR':
        return t('administration.queries.warc.dialog.states.ERROR');
      case 'STOPPED':
        return t('administration.queries.warc.dialog.states.STOPPED');
      case 'DONE':
        return t('administration.queries.warc.dialog.states.DONE');
    }
    return t('administration.queries.warc.dialog.states.ERROR');
  };

  useEffect(() => {
    refreshArchives();
    const interval = setInterval(refreshArchives, 5000);
    return () => clearInterval(interval);
  }, [id]);

  return (
    <Grid container justifyContent="space-between" spacing={2} className={classes.dialog}>
      <Grid item xs={12}>
        <Typography variant="h2">
          {t<string>('administration.queries.warc.dialog.title')}
        </Typography>
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="body1">{stateToString(currentState)}</Typography>
      </Grid>

      {warcArchives.length > 0 && (
        <Grid item xs={12} className={classes.overflow}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t<string>('query.name')}</TableCell>
                  <TableCell>{t<string>('query.created')}</TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    {t<string>('query.buttons.download')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {warcArchives.map((warcArchives) => (
                  <TableRow hover key={warcArchives.id}>
                    <TableCell>{warcArchives.name}</TableCell>
                    <TableCell>
                      {new Date(warcArchives.createdAt).toLocaleString(i18n.language)}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <IconButton
                        aria-label="download"
                        onClick={() => handleDownload(warcArchives)}>
                        <GetAppIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}

      <Grid item xs={12}>
        <Grid container justifyContent="flex-end" spacing={2}>
          {currentState === 'REQUEST' && (
            <Grid item>
              <Button
                key="download"
                variant="contained"
                color={'secondary'}
                size="medium"
                onClick={handleDenyExport}>
                <>
                  <Cancel className={classes.icon} />
                  {t<string>('administration.queries.warc.dialog.denyRequest')}
                </>
              </Button>
            </Grid>
          )}
          <Grid item>
            <Button
              key="download"
              variant="contained"
              color={'primary'}
              disabled={['INDEXING', 'PROCESSING'].includes(currentState)}
              size="medium"
              onClick={handleStartExport}>
              <>
                <GetAppIcon className={classes.icon} />
                {t<string>(
                  'administration.queries.warc.dialog.' +
                    (currentState == 'DONE' ? 'regenerate' : 'generate')
                )}
              </>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default WarcArchivesAdminDialog;
