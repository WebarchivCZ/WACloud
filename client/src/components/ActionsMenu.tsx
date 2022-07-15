import React, { ReactNode, DOMAttributes, forwardRef, Ref } from 'react';
import { IconButton, ListItemIcon, ListItemText, MenuItem } from '@material-ui/core';
import MoreHorizOutlined from '@material-ui/icons/MoreHorizOutlined';
import { KeyboardArrowRight } from '@material-ui/icons';
import { Link } from 'react-router-dom';

import Menu from './Menu';

export type MenuAction = {
  icon: ReactNode;
  title: string;
} & (
  | { onClick?: DOMAttributes<HTMLElement>['onClick'] }
  | { to?: string }
  | { actions: MenuAction[] }
);

type Props = {
  actions: MenuAction[];
  icon?: ReactNode;
  hideEmpty?: boolean;
};

const ActionNode = forwardRef(({ icon, title, ...p }: MenuAction, ref?: Ref<HTMLLIElement>) => (
  <MenuItem
    {...('to' in p
      ? {
          component: Link,
          to: p.to
        }
      : {})}
    onClick={'onClick' in p ? p.onClick : undefined}
    ref={ref}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText>{title}</ListItemText>
    {'actions' in p && <KeyboardArrowRight fontSize="small" />}
  </MenuItem>
));

ActionNode.displayName = 'ActionNode';

const renderActions = ({ actions }: Props) =>
  actions.map((a) =>
    'actions' in a ? (
      <Menu key={a.title} control={(handleMenu) => <ActionNode {...a} onClick={handleMenu} />}>
        {renderActions({ actions: a.actions })}
      </Menu>
    ) : (
      <ActionNode key={a.title} {...a} />
    )
  );

const ActionsMenu = (props: Props) =>
  props.actions.length <= 0 && props.hideEmpty ? null : (
    <Menu
      control={(handleMenu) => (
        <IconButton
          onClick={handleMenu}
          disabled={!props.actions.length}
          size="medium"
          color="primary">
          {props.icon ? props.icon : <MoreHorizOutlined />}
        </IconButton>
      )}>
      {renderActions(props)}
    </Menu>
  );

export default ActionsMenu;
