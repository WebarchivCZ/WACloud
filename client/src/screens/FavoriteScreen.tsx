import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Header } from '../components/Header';
import { UserMenu } from '../components/UserMenu';

const FavoriteScreen = () => {
  const { t } = useTranslation();

  return (
    <Header
      toolbar={
        <>
          <Link to="/search" style={{ color: '#0000ff' }}>
            {t<string>('header.newQuery')}
          </Link>
          <Link to="/favorite">{t<string>('header.favorite')}</Link>
          <Link to="/history">{t<string>('header.myQueries')}</Link>
          <UserMenu />
        </>
      }></Header>
  );
};

export default FavoriteScreen;
