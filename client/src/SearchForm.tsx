import React, { useState } from 'react';
import { Grid, Fab, Snackbar } from '@material-ui/core';
import Filters from './Filters';
import StaticQueries from './StaticQueries';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import stopWordsCzech from "./StopWords";


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
  stopWords: string[],
  filterRandomSize?: number
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function SearchForm() {
  const [queries, setQueries] = useState<IQuery[]>([]);
  const [filter, setFilter] = useState<IFilter>({filter: "", filterIdsList: "", stopWords: stopWordsCzech.sort(), filterRandomSize: 1000});
  const [error, setError] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);

  const handleSearch = () => {
    fetch("/api/search", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base: {
          filter: (filter.filter.length === 0 ? "*:*" : filter.filter),
          entries: filter.filterRandomSize,
          stopWords: filter.stopWords.map(v => v.trim())
        }, queries: queries.map(function(x) {
          return {
            type: x.searchType,
            texts: x.queries,
            contextSize: (x.context ? x.contextSize : 0)
          };
        })}),
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
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
    <>
      <Filters filter={filter} setFilter={setFilter}/>
      <StaticQueries queries={queries} setQueries={setQueries}/>
      <Grid item xs={12} justify="flex-end" style={{textAlign: "right", paddingRight: "2rem", marginTop: "2rem"}}>
        <Fab variant="extended" color="primary" onClick={handleSearch}>Vyhledat</Fab>
      </Grid>
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
    </>
  );
}

export default SearchForm;
