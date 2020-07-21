import React, { useState } from 'react';
import { Container, CssBaseline, makeStyles, Grid, Fab } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import './App.css';
import Filters from './Filters';
import StaticQueries from './StaticQueries';

const useStyles = makeStyles(() => ({
  root: {
    margin: `theme.spacing(3) auto`
  }
}));

export interface IQuery {
  type: string,
  searchText: string,
  queries: string[],
  context: boolean,
  contextLength?: number,
  topWords?: number
}

function App() {
	const classes = useStyles();
  
  const [queries, setQueries] = useState<IQuery[]>([]);
  
  return (
  	<MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Container className={classes.root}>
        <CssBaseline/>
        <Filters/>
        <StaticQueries queries={queries} setQueries={setQueries}/>
        <Grid item xs={12} justify="flex-end" style={{textAlign: "right", paddingRight: "2rem"}}>
          <Fab variant="extended" color="primary">Vyhledat</Fab>
        </Grid>
  	 </Container>
    </MuiPickersUtilsProvider>
  );
}

export default App;
