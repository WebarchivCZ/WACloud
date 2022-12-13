import React, { useState } from 'react';
import { Link, Menu, MenuItem } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';

import { useAuth } from '../services/useAuth';

export const UserMenu = () => {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const history = useHistory();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangeLanguage = () => {
    i18n.changeLanguage(i18n.language === 'cs' ? 'en' : 'cs').finally(handleClose);
  };

  const handleGoToAdmin = () => {
    history.push('/admin/queries');
  };

  const handleGoToSearch = () => {
    history.push('/search');
  };

  const handleLogout = () => {
    auth?.signOut();
  };

  return (
    <>
      <Link href="#" onClick={handleMenu}>
        {t<string>('header.user')}
      </Link>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}>
        {/*{auth?.user && <MenuItem>{auth?.user?.username}</MenuItem>}*/}
        {auth?.user?.role === 'ADMIN' && !location.pathname.startsWith('/admin') && (
          <MenuItem onClick={handleGoToAdmin}>{t<string>('header.adminZone')}</MenuItem>
        )}
        {auth?.user?.role === 'ADMIN' && location.pathname.startsWith('/admin') && (
          <MenuItem onClick={handleGoToSearch}>{t<string>('header.clientZone')}</MenuItem>
        )}
        <MenuItem onClick={handleChangeLanguage}>
          {i18n.language === 'cs' ? 'English' : 'Czech'}
        </MenuItem>
        <MenuItem onClick={handleLogout}>{t<string>('header.logout')}</MenuItem>
      </Menu>
    </>
  );
};
