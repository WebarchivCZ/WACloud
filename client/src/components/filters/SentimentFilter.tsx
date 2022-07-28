import { Button, InputLabel, Slider } from '@material-ui/core';
import SentimentVerySatisfiedIcon from '@material-ui/icons/SentimentVerySatisfied';
import React from 'react';
import { useTranslation } from 'react-i18next';
import withStyles from '@material-ui/core/styles/withStyles';

import { ValuableProps } from '../../interfaces/ValuableProps';

import { FilterContent } from './FilterContent';

const ColoredSlider = withStyles((theme) => ({
  root: {
    color: '#757575',
    margin: theme.spacing(0, 0.75),
    width: '94%'
  }
}))(Slider);

export const SentimentFilter = ({
  value,
  setValue,
  append,
  disabled,
  query
}: ValuableProps<number | number[]> & { query: string }) => {
  const { t } = useTranslation();

  const buttonClick = (positive: boolean) => () => {
    if (append) {
      append(
        (query.length > 0
          ? !query.trim().endsWith('AND') &&
            !query.trim().endsWith('OR') &&
            !query.trim().endsWith('NOT')
            ? ' AND '
            : ''
          : '') +
          (!positive ? 'NOT ' : '') +
          'sentiment:' +
          ((value as number[])
            ? '[' + (value as number[])[0] + ' TO ' + (value as number[])[1] + ']'
            : value)
      );
    }
    setValue([-1, 1]);
  };

  const buttonDisabled =
    (value as number[]).length === 2 &&
    (value as number[])[0] === -1 &&
    (value as number[])[1] === 1;

  return (
    <FilterContent
      title={t<string>('filters.sentiment')}
      icon={<SentimentVerySatisfiedIcon />}
      buttons={[
        <Button
          key="true"
          variant="contained"
          color={'primary'}
          disabled={disabled || buttonDisabled}
          size="small"
          onClick={buttonClick(true)}>
          =
        </Button>,
        <Button
          key="false"
          variant="contained"
          color={'primary'}
          disabled={disabled || buttonDisabled}
          size="small"
          onClick={buttonClick(false)}>
          ≠
        </Button>
      ]}>
      <InputLabel>{t<string>('filters.sentiment')}</InputLabel>
      <ColoredSlider
        step={0.1}
        marks
        min={-1.0}
        max={1.0}
        color="secondary"
        valueLabelDisplay="auto"
        value={value}
        disabled={disabled}
        onChange={(
          _event: React.ChangeEvent<Record<string, unknown>>,
          newValue: number | number[]
        ) => {
          setValue(newValue);
        }}
      />
    </FilterContent>
  );
};
