import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container } from '@material-ui/core';

import { Header } from '../components/Header';
import { UserMenu } from '../components/UserMenu';
import { HistoryForm } from '../forms/HistoryForm';

const HistoryScreen = () => {
  const { t } = useTranslation();

  return (
    <Header
      toolbar={
        <>
          <Link to="/search">{t<string>('header.newQuery')}</Link>
          <Link to="/favorite">{t<string>('header.favorite')}</Link>
          <Link to="/history" style={{ color: '#0000ff' }}>
            {t<string>('header.myQueries')}
          </Link>
          <Link to="/faq">FAQ</Link>
          <UserMenu />
        </>
      }>
      <Container>
        <HistoryForm />
      </Container>
    </Header>
  );
};

export default HistoryScreen;
