import React, { Dispatch, SetStateAction, useContext } from 'react';
import { Button, MenuItem, TextField } from '@material-ui/core';
import HttpIcon from '@material-ui/icons/Http';
import { useTranslation } from 'react-i18next';
import AddIcon from '@material-ui/icons/Add';

import { SearchContext } from '../Search.context';

import { FilterContent } from './FilterContent';

interface UrlFilterProps<T> {
  operator: T;
  setOperator: Dispatch<SetStateAction<T>>;
  url: T;
  setUrl: Dispatch<SetStateAction<T>>;
  append?: (appendValue: string) => void;
  disabled?: boolean;
}

export const UrlFilter = ({
  operator,
  setOperator,
  url,
  setUrl,
  append,
  disabled
}: UrlFilterProps<string | null>) => {
  const { t } = useTranslation();

  const { state } = useContext(SearchContext);

  const buttonClick = () => {
    const prefix =
      state.query.length > 0
        ? !state.query.trim().endsWith('AND') &&
          !state.query.trim().endsWith('OR') &&
          !state.query.trim().endsWith('NOT')
          ? ' AND '
          : ''
        : '';
    if (append) {
      switch (operator) {
        case 'contain':
          append(prefix + 'url:/.*' + url + '.*/');
          break;
        case 'contain-not':
          append(prefix + 'NOT url:/.*' + url + '.*/');
          break;
        case 'equal-not':
          append(prefix + 'NOT url:"' + url + '"');
          break;
        default:
          append(prefix + 'url:"' + url + '"');
      }
    }
    setUrl('');
  };
  return (
    <FilterContent
      title={t<string>('filters.url')}
      icon={<HttpIcon />}
      buttons={[
        <Button
          key="add"
          variant="contained"
          color={'primary'}
          disabled={disabled || !operator || !url}
          size="small"
          onClick={buttonClick}>
          <AddIcon fontSize="small" />
        </Button>
      ]}>
      <TextField
        select
        fullWidth
        label={t<string>('filters.operator.label')}
        value={operator}
        disabled={disabled}
        onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
          setOperator(event.target.value as string);
        }}>
        <MenuItem value="contain">{t<string>('filters.operator.contain')}</MenuItem>
        <MenuItem value="contain-not">{t<string>('filters.operator.contain-not')}</MenuItem>
        <MenuItem value="equal">{t<string>('filters.operator.equal')}</MenuItem>
        <MenuItem value="equal-not">{t<string>('filters.operator.equal-not')}</MenuItem>
      </TextField>
      <br />
      <TextField
        label={t<string>('filters.url')}
        value={url}
        disabled={disabled}
        fullWidth
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setUrl(event.target.value);
        }}
      />
    </FilterContent>
  );
};
