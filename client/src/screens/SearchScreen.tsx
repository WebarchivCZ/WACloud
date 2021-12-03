import React, {useState} from 'react';
import {useTranslation} from "react-i18next";
import {Header} from "../components/Header";
import {Link} from "react-router-dom";
import {UserMenu} from "../components/UserMenu";
import {FiltersDrawer} from "../components/FiltersDrawer";
import {QueryForm} from "../forms/QueryForm";
import stopWordsCzech from "../config/stopWords";
import {addNotification} from "../config/notifications";
import AnalyticQueriesForm from "../forms/AnalyticQueriesForm";
import {IQuery} from "../old/SearchForm";
import {Box, Button, Divider, Fab, Grid} from "@material-ui/core";

export const SearchScreen = () => {
  const { t } = useTranslation();

  const [drawerOpen, setDrawerOpen] = React.useState(true);
  const [query, setQuery] = useState<string>("");
  const [stopWords, setStopWords] = useState<string[]>(stopWordsCzech.sort());
  const [entriesLimit, setEntriesLimit] = useState<number>(1000);

  const [queries, setQueries] = useState<IQuery[]>([]);

  const handleSearch = () => {
    addNotification(t('query.start.title'), t('query.start.message'), 'info');
    fetch("/api/search", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base: {
          filter: (query.length === 0 ? "*:*" : query),
          entries: entriesLimit,
          stopWords: stopWords.map(v => v.trim())
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
        addNotification(t('query.success.title'), t('query.success.message'), 'success');
      })
      .catch(_error => addNotification(t('query.error.title'), t('query.error.message'), 'danger'));
  };

  return (
    <Header toolbar={
      <>
        <Link to="/search">{t('header.newQuery')}</Link>
        {/*<Link to="/favorite">{t('header.favorite')}</Link>*/}
        {/*<Link to="/history">{t('header.history')}</Link>*/}
        <UserMenu />
      </>
    } drawer={
      <FiltersDrawer query={query} setQuery={setQuery}
                     stopWords={stopWords} setStopWords={setStopWords}
                     entriesLimit={entriesLimit} setEntriesLimit={setEntriesLimit}
                     drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}/>
    }>
      <Box m={2}>
        <QueryForm value={query} setValue={setQuery}/>
      </Box>
      <Divider/>
      <Box m={2}>
        <AnalyticQueriesForm queries={queries} setQueries={setQueries}/>
      </Box>
      {queries.length >0 && (
        <>
          <Divider/>
          <Box m={2}>
            <Button variant="contained" size="large" color="primary" onClick={handleSearch}>
              {t('query.search')}
            </Button>
          </Box>
        </>
      )}
    </Header>
  );
};

