import { Button, Typography } from '@material-ui/core';
import SpellcheckIcon from '@material-ui/icons/Spellcheck';
import React from 'react';
import { useTranslation } from 'react-i18next';
import EditIcon from '@material-ui/icons/Edit';

import { ValuableProps } from '../../interfaces/ValuableProps';

import { FilterContent } from './FilterContent';

export const StopWordsFilter = ({ value, disabled }: ValuableProps<string[]>) => {
  // TODO use setValue
  const { t } = useTranslation();
  return (
    <FilterContent
      title={t<string>('filters.stopWords.title')}
      icon={<SpellcheckIcon />}
      buttons={[
        <Button key="edit" variant="outlined" color="default" disabled={disabled} size="small">
          <EditIcon fontSize="small" />
        </Button>
      ]}>
      <Typography variant="body2" style={{ whiteSpace: 'break-spaces' }}>
        {value.slice(0, 8).join(', ') + (value.length > 8 ? ',...' : '')}
      </Typography>
    </FilterContent>
  );
};
