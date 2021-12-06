import React, {useEffect, useState} from 'react';
import {
  CircularProgress,
  Fab,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
import {makeStyles} from "@material-ui/core/styles";
import PublishIcon from '@material-ui/icons/Publish';
import MuiAlert, {AlertProps} from "@material-ui/lab/Alert";
import {useTranslation} from "react-i18next";
import IHarvest from "../interfaces/IHarvest";

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
  },
  header: {
    margin: theme.spacing(3, 0)
  },
}));

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export const AdminHarvestsForm = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [harvests, setHarvests] = useState<IHarvest[]>([]);
  const [version, setVersion] = useState<string>("");
  const [actionStarted, setActionStarted] = useState<boolean>(false);
  const [actionEnded, setActionEnded] = useState<boolean>(false);

  const stateToString = (state: string) => t('administration.harvests.states.'+(
    ["UNPROCESSED", "PROCESSING", "INDEXED", "ERROR", "CLEARED"].includes(state) ? state : 'UNKNOWN'
  ));

  const handleCloseActionStarted = () => {
    setActionStarted(false);
  };

  const handleCloseActionEnded = () => {
    setActionEnded(false);
  };

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
    fetch("/api")
      .then(res => res.json())
      .then(
        (result) => {
          setVersion(result.version);
        },
        (_error) => {
          setVersion("");
        }
      );

    const interval = setInterval(refreshHarvests, 10000);
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Typography variant="h2" className={classes.header}>
        {t('administration.harvests.title')} {version.length > 0 ? "(v"+version+")" : ""}
      </Typography>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="harvests">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell align="right">Datum</TableCell>
              <TableCell align="right">Typ</TableCell>
              <TableCell align="right">Stav</TableCell>
              <TableCell align="right">Záznamov</TableCell>
              <TableCell align="right">Importovat</TableCell>
              <TableCell align="right">Zmazať</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {harvests.map((row) => (
              <TableRow key={row.identification}>
                <TableCell component="th" scope="row">
                  {row.identification}
                </TableCell>
                <TableCell align="right">{row.date}</TableCell>
                <TableCell align="right">{row.type}</TableCell>
                <TableCell align="right">
                  {stateToString(row.state)}
                  {(row.state === "UNPROCESSED" || row.state === "PROCESSING") && <CircularProgress size={15} />}
                </TableCell>
                <TableCell align="right">{row.entries}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="import">
                    <PublishIcon onClick={() => {
                      setActionStarted(true);
                      fetch("/api/harvest/index?harvestId="+row.identification, {method: 'POST'}).then(() => {
                        refreshHarvests();
                        setActionStarted(false);
                        setActionEnded(true);
                      })
                    }}/>
                  </IconButton>
                </TableCell>
                <TableCell align="right">
                  <IconButton aria-label="import">
                    <PublishIcon onClick={() => {
                      setActionStarted(true);
                      fetch("/api/harvest/clear?harvestId="+row.identification, {method: 'POST'}).then(() => {
                        refreshHarvests();
                        setActionStarted(false);
                        setActionEnded(true);
                      })
                    }}/>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Grid item xs={12} justify="flex-end" style={{textAlign: "right", paddingRight: "2rem", marginTop: "2rem"}}>
        <Fab variant="extended" color="secondary" onClick={() => {
          setActionStarted(true);
          fetch("/api/harvest/clear-all", {method: 'POST'}).then(() => {
            refreshHarvests();
            setActionStarted(false);
            setActionEnded(true);
          })
        }}>Zmazat indexy</Fab>
      </Grid>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={actionStarted}
        onClose={handleCloseActionStarted}
      >
        <Alert onClose={handleCloseActionStarted} severity="success">
          Požadavek byl zadán.
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={actionEnded}
        onClose={handleCloseActionEnded}
      >
        <Alert onClose={handleCloseActionEnded} severity="success">
          Požadavek úspěšne zpracován.
        </Alert>
      </Snackbar>
    </>
  );
}
