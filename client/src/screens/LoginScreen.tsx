import React from 'react';
import { Link } from '@material-ui/core';
import { Link as LinkRouter } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import LoginForm from '../forms/LoginForm';
import { Header } from '../components/Header';

const LoginScreen = () => {
  const { t, i18n } = useTranslation();

  return (
    <Header
      toolbar={
        <>
          <LinkRouter to="/" style={{ color: '#0000ff' }}>
            {t<string>('login.header')}
          </LinkRouter>
          <LinkRouter to="/faq">FAQ</LinkRouter>
          <Link href="#" onClick={() => i18n.changeLanguage(i18n.language === 'cs' ? 'en' : 'cs')}>
            {i18n.language === 'cs' ? 'English' : 'Czech'}
          </Link>
        </>
      }>
      <LoginForm />
    </Header>
  );
};

export default LoginScreen;
