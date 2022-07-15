import React, { useImperativeHandle, MouseEvent, ReactNode, useState, forwardRef } from 'react';
import { Menu as MuiMenu, MenuProps } from '@material-ui/core';

export type MenuRefHandle = {
  handleClose: () => void;
};

type Props = {
  control: (handleMenu: (event: MouseEvent<HTMLElement>) => void, isOpen: boolean) => ReactNode;
} & Omit<MenuProps, 'anchorEl' | 'open' | 'onClose' | 'getContentAnchorEl'>;

const Menu = forwardRef<MenuRefHandle, Props>(({ control, children, ...props }, ref) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useImperativeHandle(ref, () => ({
    handleClose
  }));

  return (
    <div>
      {control(handleClick, isOpen)}
      <MuiMenu
        anchorEl={anchorEl}
        keepMounted
        open={isOpen}
        onClose={handleClose}
        // {...getMenuExpandProps(expand)}
        {...props}>
        {children}
      </MuiMenu>
    </div>
  );
});

Menu.displayName = 'Menu';

export default Menu;
