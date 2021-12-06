import React, { Suspense }  from 'react';
import { CssBaseline } from '@material-ui/core';
import {
  ThemeProvider,
} from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Spinner from "./components/Spinner";
import {theme} from "./config/theme";
import {themeAdmin} from "./config/themeAdmin";
import {GlobalCss} from "./config/css";

// Use i18n, make it available for all components with useTranslation
import './config/i18n'

// Screens
import {LoginScreen} from "./screens/LoginScreen";
import {SearchScreen} from "./screens/SearchScreen";
import {AdminHarvestsScreen} from "./screens/AdminHarvestsScreen";

function App() {
  return (
    <Suspense fallback="">
      <Suspense fallback={<Spinner />}>
        <ThemeProvider theme={theme}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <CssBaseline/>
            <GlobalCss />
            <Router>
              <Switch>
                <Route path="/admin">
                  <ThemeProvider theme={themeAdmin}>
                    <AdminHarvestsScreen/>
                  </ThemeProvider>
                </Route>
                <Route path="/search">
                  <SearchScreen/>
                </Route>
                <Route path="/">
                  <LoginScreen/>
                </Route>
              </Switch>
            </Router>
          </MuiPickersUtilsProvider>
        </ThemeProvider>
      </Suspense>
    </Suspense>
  );
}

export default App;
