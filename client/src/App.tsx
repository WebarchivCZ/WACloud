import React, { FunctionComponent, ReactNode, Suspense } from 'react';
import { CssBaseline, Grid } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { RouteProps } from 'react-router';

import Spinner from './components/Spinner';
import { theme } from './config/theme';
import { themeAdmin } from './config/themeAdmin';
import { GlobalCss } from './config/css';
// Use i18n, make it available for all components with useTranslation
import './config/i18n';
// Screens
import { LoginScreen } from './screens/LoginScreen';
import { SearchScreen } from './screens/SearchScreen';
import { AdminHarvestsScreen } from './screens/admin/AdminHarvestsScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { Dialog } from './components/dialog/Dialog';
import { DialogProvider } from './components/dialog/Dialog.context';
import { ProvideAuth, useAuth } from './services/useAuth';
import { AdminUsersScreen } from './screens/admin/AdminUsersScreen';
import { AdminQueriesScreen } from './screens/admin/AdminQueriesScreen';

const Loader = () => (
  <Grid
    container
    spacing={0}
    direction="column"
    alignItems="center"
    justifyContent="center"
    style={{ minHeight: '100vh' }}>
    <Grid item xs={3}>
      <Spinner />
    </Grid>
  </Grid>
);

const PrivateRoute: FunctionComponent<{
  children: ReactNode;
  path?: string | string[];
  role?: string;
}> = ({ children, path, role }) => {
  const auth = useAuth();
  return (
    <Route
      path={path}
      render={({ location }) =>
        auth?.user && (!role || auth.user.role === role) ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/',
              state: { from: location }
            }}
          />
        )
      }
    />
  );
};

function App() {
  return (
    <Suspense fallback="">
      <Suspense fallback={<Loader />}>
        <ThemeProvider theme={theme}>
          <DialogProvider>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <CssBaseline />
              <GlobalCss />
              <ProvideAuth>
                <Router>
                  <Switch>
                    <PrivateRoute path="/admin/queries" role="ADMIN">
                      <ThemeProvider theme={themeAdmin}>
                        <AdminQueriesScreen />
                      </ThemeProvider>
                    </PrivateRoute>
                    <PrivateRoute path="/admin/harvests" role="ADMIN">
                      <ThemeProvider theme={themeAdmin}>
                        <AdminHarvestsScreen />
                      </ThemeProvider>
                    </PrivateRoute>
                    <PrivateRoute path="/admin/users" role="ADMIN">
                      <ThemeProvider theme={themeAdmin}>
                        <AdminUsersScreen />
                      </ThemeProvider>
                    </PrivateRoute>
                    <PrivateRoute path="/search">
                      <SearchScreen />
                    </PrivateRoute>
                    <PrivateRoute path="/history">
                      <HistoryScreen />
                    </PrivateRoute>
                    <Route path="/">
                      <LoginScreen />
                    </Route>
                  </Switch>
                </Router>
              </ProvideAuth>
            </MuiPickersUtilsProvider>
            <Dialog />
          </DialogProvider>
        </ThemeProvider>
      </Suspense>
    </Suspense>
  );
}

export default App;
