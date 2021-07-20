import React  from 'react';
import { Container, CssBaseline, makeStyles } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import './App.css';
import SearchForm from "./SearchForm";
import AdminForm from "./AdminForm";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

const useStyles = makeStyles(() => ({
  root: {
    margin: `theme.spacing(3) auto`
  }
}));

function App() {
	const classes = useStyles();

  return (
  	<MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Container className={classes.root}>
        <CssBaseline/>
        <Router>
          <Switch>
            <Route path="/admin">
              <AdminForm/>
            </Route>
            <Route path="/">
              <SearchForm/>
            </Route>
          </Switch>
        </Router>
  	  </Container>
    </MuiPickersUtilsProvider>
  );
}

export default App;
