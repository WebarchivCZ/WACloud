import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container } from '@material-ui/core';

import { Header } from '../components/Header';
import { UserMenu } from '../components/UserMenu';
import { AdminHarvestsForm } from '../forms/AdminHarvestsForm';

export const AdminHarvestsScreen = () => {
  const { t } = useTranslation();

  return (
    <Header
      toolbar={
        <>
          <Link to="/admin" style={{ color: '#0000ff' }}>
            {t<string>('administration.harvests.menu')}
          </Link>
          <UserMenu />
        </>
      }>
      <Container>
        <AdminHarvestsForm />
      </Container>
    </Header>
  );
};
