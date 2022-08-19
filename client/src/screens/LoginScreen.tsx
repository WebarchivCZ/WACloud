import React from 'react';
import { Link } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import LoginForm from '../forms/LoginForm';
import { Header } from '../components/Header';

const LoginScreen = () => {
  const { i18n } = useTranslation();

  return (
    <Header
      toolbar={
        <Link href="#" onClick={() => i18n.changeLanguage(i18n.language === 'cs' ? 'en' : 'cs')}>
          {i18n.language === 'cs' ? 'English' : 'Czech'}
        </Link>
      }>
      <LoginForm />
    </Header>
  );
};

export default LoginScreen;
