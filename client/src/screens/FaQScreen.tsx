import React, { useEffect, useState } from 'react';
import { Container, Link } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link as LinkRouter } from 'react-router-dom';

import { Header } from '../components/Header';
import { useAuth } from '../services/useAuth';
import { UserMenu } from '../components/UserMenu';

const FaQScreen = () => {
  const { t, i18n } = useTranslation();
  const auth = useAuth();

  const [page, setPage] = useState('');

  useEffect(() => {
    fetch('/markdown/FaQ.md')
      .then((res) => res.text())
      .then((res) => setPage(res));
  }, []);

  return (
    <Header
      toolbar={
        <>
          {auth?.user && (
            <>
              <LinkRouter to="/search">{t<string>('header.newQuery')}</LinkRouter>
              <LinkRouter to="/favorite">{t<string>('header.favorite')}</LinkRouter>
              <LinkRouter to="/history">{t<string>('header.myQueries')}</LinkRouter>
              <LinkRouter to="/faq" style={{ color: '#0000ff' }}>
                FAQ
              </LinkRouter>
              <UserMenu />
            </>
          )}
          {!auth?.user && (
            <>
              <LinkRouter to="/">{t<string>('login.header')}</LinkRouter>
              <LinkRouter to="/faq" style={{ color: '#0000ff' }}>
                FAQ
              </LinkRouter>
              <Link
                href="#"
                onClick={() => i18n.changeLanguage(i18n.language === 'cs' ? 'en' : 'cs')}>
                {i18n.language === 'cs' ? 'English' : 'Czech'}
              </Link>
            </>
          )}
        </>
      }>
      <Container>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{page}</ReactMarkdown>
      </Container>
    </Header>
  );
};

export default FaQScreen;
