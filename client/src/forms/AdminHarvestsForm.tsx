import React, {useEffect, useState} from 'react';
import {
  Box, Button, Card,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
import PublishIcon from '@material-ui/icons/Publish';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import {useTranslation} from "react-i18next";
import IHarvest from "../interfaces/IHarvest";
import {addNotification} from "../config/notifications";

export const AdminHarvestsForm = () => {
  const { t, i18n } = useTranslation();

  const [harvests, setHarvests] = useState<IHarvest[]>([]);

  const stateToString = (state: string) => t('administration.harvests.states.'+(
    ["UNPROCESSED", "PROCESSING", "INDEXED", "ERROR", "CLEARED"].includes(state) ? state : 'UNKNOWN'
  ));

  const refreshHarvests = () => {
    fetch("/api/harvest")
      .then(res => res.json())
      .then(
        (result) => {
          setHarvests(result);
        },
        (_error) => {
          setHarvests([]);
        }
      );
  };

  useEffect(() => {
    refreshHarvests();

    const interval = setInterval(refreshHarvests, 10000);
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Typography variant="h1">
        {t('administration.harvests.title')}
      </Typography>
      <Card variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('administration.harvests.columns.id')}</TableCell>
                <TableCell>{t('harvests.date')}</TableCell>
                <TableCell>{t('administration.harvests.columns.type')}</TableCell>
                <TableCell>{t('query.state')}</TableCell>
                <TableCell>{t('administration.harvests.columns.numberOfRecords')}</TableCell>
                <TableCell/>
              </TableRow>
            </TableHead>
            <TableBody>
              {harvests.map((row) => (
                <TableRow hover key={row.identification}>
                  <TableCell component="th" scope="row">{row.identification}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>
                    {stateToString(row.state)}
                  </TableCell>
                  <TableCell>{row.entries.toLocaleString(i18n.language)}</TableCell>
                  <TableCell>
                    {!['UNPROCESSED','PROCESSING','INDEXED'].includes(row.state) && (
                      <Button color="primary"
                              onClick={() => {
                                addNotification(
                                  t('administration.harvests.notifications.import.start.title'),
                                  t('administration.harvests.notifications.import.start.message'),
                                  'info'
                                );
                                fetch("/api/harvest/index?harvestId="+row.identification, {method: 'POST'}).then(() => {
                                  refreshHarvests();
                                  addNotification(
                                    t('administration.harvests.notifications.import.success.title'),
                                    t('administration.harvests.notifications.import.success.message'),
                                    'success'
                                  );
                                }).catch(() => {
                                  addNotification(
                                    t('administration.harvests.notifications.import.error.title'),
                                    t('administration.harvests.notifications.import.error.message'),
                                    'danger'
                                  );
                                })
                              }}
                              startIcon={<PublishIcon/>}
                      >
                        {t('administration.harvests.actions.import')}
                      </Button>
                    )}
                    {row.state === "INDEXED" && (
                      <Button color="secondary"
                              onClick={() => {
                                addNotification(
                                  t('administration.harvests.notifications.delete.start.title'),
                                  t('administration.harvests.notifications.delete.start.message'),
                                  'info'
                                );
                                fetch("/api/harvest/clear?harvestId="+row.identification, {method: 'POST'}).then(() => {
                                  refreshHarvests();
                                  addNotification(
                                    t('administration.harvests.notifications.delete.success.title'),
                                    t('administration.harvests.notifications.delete.success.message'),
                                    'success'
                                  );
                                }).catch(() => {
                                  addNotification(
                                    t('administration.harvests.notifications.delete.error.title'),
                                    t('administration.harvests.notifications.delete.error.message'),
                                    'danger'
                                  );
                                })
                              }}
                              startIcon={<DeleteForeverIcon/>}
                      >
                        {t('administration.harvests.actions.delete')}
                      </Button>
                    )}
                    {['UNPROCESSED','PROCESSING'].includes(row.state) && <CircularProgress size={15} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <Box my={4}>
        <Button variant="contained" color="secondary" size="large" onClick={() => {
          addNotification(
            t('administration.harvests.notifications.deleteAll.start.title'),
            t('administration.harvests.notifications.deleteAll.start.message'),
            'info'
          );
          fetch("/api/harvest/clear-all", {method: 'POST'}).then(() => {
            refreshHarvests();
            addNotification(
              t('administration.harvests.notifications.deleteAll.success.title'),
              t('administration.harvests.notifications.deleteAll.success.message'),
              'success'
            );
          }).catch(() => {
            addNotification(
              t('administration.harvests.notifications.deleteAll.error.title'),
              t('administration.harvests.notifications.deleteAll.error.message'),
              'danger'
            );
          })
        }}>{t('administration.harvests.actions.deleteAll')}</Button>
      </Box>
    </>
  );
}
