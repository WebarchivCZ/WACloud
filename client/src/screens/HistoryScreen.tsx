import React from 'react';
import {useTranslation} from "react-i18next";
import {Header} from "../components/Header";
import {Link} from "react-router-dom";
import {UserMenu} from "../components/UserMenu";
import {Container} from "@material-ui/core";
import {HistoryForm} from "../forms/HistoryForm";

export const HistoryScreen = () => {
  const { t } = useTranslation();

  return (
    <Header toolbar={
      <>
        <Link to="/search">{t('header.newQuery')}</Link>
        {/*<Link to="/favorite">{t('header.favorite')}</Link>*/}
        <Link to="/history" style={{color: '#0000ff'}}>{t('header.myQueries')}</Link>
        <UserMenu />
      </>
    }>
      <Container>
        <HistoryForm/>
      </Container>
    </Header>
  );
};

