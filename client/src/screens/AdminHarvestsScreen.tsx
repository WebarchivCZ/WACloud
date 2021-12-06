import React from 'react';
import {useTranslation} from "react-i18next";
import {Header} from "../components/Header";
import {Link} from "react-router-dom";
import {UserMenu} from "../components/UserMenu";
import {AdminHarvestsForm} from "../forms/AdminHarvestsForm";

export const AdminHarvestsScreen = () => {
  const { t } = useTranslation();

  return (
    <Header toolbar={
      <>
        <Link to="/admin">{t('administration.harvests.menu')}</Link>
        {/*<Link to="/favorite">{t('header.favorite')}</Link>*/}
        {/*<Link to="/history">{t('header.myQueries')}</Link>*/}
        <UserMenu />
      </>
    }>
      <AdminHarvestsForm/>
    </Header>
  );
};

