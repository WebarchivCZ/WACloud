import React, { useContext } from 'react';
import { Button, MenuItem, TextField } from '@material-ui/core';
import DvrIcon from '@material-ui/icons/Dvr';
import { useTranslation } from 'react-i18next';

import { ValuableOptionalsProps } from '../../interfaces/ValuableOptionalsProps';
import { SearchContext } from '../Search.context';

import { FilterContent } from './FilterContent';

export const PageTypeFilter = ({
  options,
  value,
  setValue,
  append,
  disabled
}: ValuableOptionalsProps<string | undefined>) => {
  const { t } = useTranslation();
  const { state } = useContext(SearchContext);

  const buttonClick = (positive: boolean) => () => {
    if (append) {
      append(
        (state.query.length > 0
          ? !state.query.trim().endsWith('AND') &&
            !state.query.trim().endsWith('OR') &&
            !state.query.trim().endsWith('NOT')
            ? ' AND '
            : ''
          : '') +
          (!positive ? 'NOT ' : '') +
          'webType:"' +
          value +
          '"'
      );
    }
    setValue('');
  };

  return (
    <FilterContent
      title={t<string>('filters.pageType')}
      icon={<DvrIcon />}
      buttons={[
        <Button
          key="true"
          variant="contained"
          color={'primary'}
          disabled={disabled || value === ''}
          size="small"
          onClick={buttonClick(true)}>
          =
        </Button>,
        <Button
          key="false"
          variant="contained"
          color={'primary'}
          disabled={disabled || value === ''}
          size="small"
          onClick={buttonClick(false)}>
          ≠
        </Button>
      ]}>
      <TextField
        select
        fullWidth
        label={t<string>('filters.pageType')}
        value={value}
        disabled={disabled}
        onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
          setValue(event.target.value as string);
        }}>
        {options.map((v) => {
          return (
            <MenuItem key={v} value={v}>
              {v}
            </MenuItem>
          );
        })}
      </TextField>
    </FilterContent>
  );
};
