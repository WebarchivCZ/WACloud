import { Container } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Header } from '../components/Header';
import { UserMenu } from '../components/UserMenu';
import { FavoriteForm } from '../forms/FavoriteForm';

const FavoriteScreen = () => {
  const { t } = useTranslation();

  return (
    <Header
      toolbar={
        <>
          <Link to="/search">{t<string>('header.newQuery')}</Link>
          <Link to="/favorite" style={{ color: '#0000ff' }}>
            {t<string>('header.favorite')}
          </Link>
          <Link to="/history">{t<string>('header.myQueries')}</Link>
          <Link to="/faq">FAQ</Link>
          <UserMenu />
        </>
      }>
      <Container>
        <FavoriteForm />
      </Container>
    </Header>
  );
};

export default FavoriteScreen;
