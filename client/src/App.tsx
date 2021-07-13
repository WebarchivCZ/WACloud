import React, { useState } from 'react';
import { Container, CssBaseline, makeStyles, Grid, Fab, Snackbar } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import './App.css';
import Filters from './Filters';
import StaticQueries from './StaticQueries';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

const useStyles = makeStyles(() => ({
  root: {
    margin: `theme.spacing(3) auto`
  }
}));

export interface IQuery {
  searchType: string,
  searchText: string,
  queries: string[],
  query: string,
  context: boolean,
  contextSize?: number,
  lim?: number
}

export interface IFilter {
  filter: string,
  filterIdsList: string,
  filterRandomSize?: number
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function App() {
	const classes = useStyles();
  
  const [queries, setQueries] = useState<IQuery[]>([]);
  const [filter, setFilter] = useState<IFilter>({filter: "", filterIdsList: "", filterRandomSize: 100});
  const [error, setError] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  
  const handleSearch = () => {
    fetch("/api/search/solr/zip", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({filter: filter.filter, entries: filter.filterRandomSize}),
      })
      .then(response => response.blob())
      .then(blob => {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "results.zip";
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();
        a.remove();  //afterwards we remove the element again
      })
      .catch(_error => setError(true));
  };
  
  const handleCloseError = () => {
    setError(false);
  };
  
  const handleCloseSent = () => {
    setSent(false);
  };
  
  return (
  	<MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Container className={classes.root}>
        <CssBaseline/>
        <Filters filter={filter} setFilter={setFilter}/>
        {/*<StaticQueries queries={queries} setQueries={setQueries}/>*/}
        <Grid item xs={12} justify="flex-end" style={{textAlign: "right", paddingRight: "2rem", marginTop: "2rem"}}>
          <Fab variant="extended" color="primary" onClick={handleSearch}>Vyhledat</Fab>
        </Grid>
  	  </Container>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={error}
        onClose={handleCloseError}
      >
        <Alert onClose={handleCloseError} severity="error">
          An Error occurs
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={sent}
        onClose={handleCloseSent}
      >
        <Alert onClose={handleCloseSent} severity="success">
          Search query created.
        </Alert>
      </Snackbar>
    </MuiPickersUtilsProvider>
  );
};

export default App;
