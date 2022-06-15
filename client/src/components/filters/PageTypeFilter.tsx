import { Button, MenuItem, TextField } from '@material-ui/core';
import DvrIcon from '@material-ui/icons/Dvr';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ValuableOptionalsProps } from '../../interfaces/ValuableOptionalsProps';

import { FilterContent } from './FilterContent';

export const PageTypeFilter = ({
  options,
  value,
  setValue,
  append,
  disabled
}: ValuableOptionalsProps<string | undefined>) => {
  const { t } = useTranslation();

  const buttonClick = (positive: boolean) => () => {
    if (append) {
      append((!positive ? 'NOT ' : '') + 'webType:"' + value + '"');
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
