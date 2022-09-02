import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container } from '@material-ui/core';

import { Header } from '../../components/Header';
import { UserMenu } from '../../components/UserMenu';
import { AdminHarvestsForm } from '../../forms/AdminHarvestsForm';

const AdminHarvestsScreen = () => {
  const { t } = useTranslation();

  return (
    <Header
      toolbar={
        <>
          <Link to="/admin/queries">{t<string>('header.queriesAdmin')}</Link>
          <Link to="/admin/harvests" style={{ color: '#0000ff' }}>
            {t<string>('header.harvestsAdmin')}
          </Link>
          <Link to="/admin/users">{t<string>('header.usersAdmin')}</Link>
          <UserMenu />
        </>
      }>
      <Container>
        <AdminHarvestsForm />
      </Container>
    </Header>
  );
};

export default AdminHarvestsScreen;
