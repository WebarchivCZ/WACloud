import React, { useState, useContext } from 'react';
import { Button, TextField } from '@material-ui/core';
import ClassIcon from '@material-ui/icons/Class';
import { Autocomplete } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';

import { ValuableOptionalsProps } from '../../interfaces/ValuableOptionalsProps';
import { SearchContext } from '../Search.context';

import { FilterContent } from './FilterContent';

export const ThemeFilter = ({
  options,
  value,
  setValue,
  append,
  disabled
}: ValuableOptionalsProps<string | null> & { query: string }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState<string | undefined>('');

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
          'topics:"' +
          value +
          '"'
      );
    }
    setValue('');
  };

  return (
    <FilterContent
      title={t<string>('filters.theme')}
      icon={<ClassIcon />}
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
      <Autocomplete
        value={value}
        disabled={disabled}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        inputValue={input}
        onInputChange={(event, newValue) => {
          setInput(newValue);
        }}
        options={options.sort((a, b) => -b.toLowerCase().localeCompare(a.toLowerCase()))}
        groupBy={(option) => option.toLowerCase().charAt(0)}
        renderInput={(params) => <TextField {...params} label={t<string>('filters.theme')} />}
      />
    </FilterContent>
  );
};
