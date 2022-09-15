import React, { Dispatch, SetStateAction, useContext } from 'react';
import { Box, Checkbox, FormControlLabel, TextField } from '@material-ui/core';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import { useTranslation } from 'react-i18next';

import { ValuableProps } from '../../interfaces/ValuableProps';
import { SearchContext } from '../Search.context';
import { Types } from '../reducers';

import { FilterContent } from './FilterContent';

const MAX_SEED = 10000000;
type SeedProps<T> = {
  setSeed: Dispatch<SetStateAction<T>>;
  seed: T;
};

export const EntriesLimitFilter = ({
  value,
  setValue,
  seed,
  setSeed,
  disabled
}: ValuableProps<number> & SeedProps<number | null>) => {
  const { t } = useTranslation();

  const { state, dispatch } = useContext(SearchContext);

  return (
    <FilterContent title={t<string>('filters.entriesLimit')} icon={<FormatListNumberedIcon />}>
      <Box my={2}>
        <TextField
          type="number"
          label={t<string>('filters.entriesLimit')}
          fullWidth
          inputProps={{ min: 10, max: 10000 }}
          value={state.entriesLimit}
          disabled={disabled}
          onChange={(event) =>
            dispatch({
              type: Types.SetLimit,
              payload: { entriesLimit: parseInt(event.target.value) }
            })
          }
        />
      </Box>
      <Box my={2}>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={state.seed != null}
              disabled={disabled}
              onChange={(event) =>
                dispatch({
                  type: Types.SetSeed,
                  payload: {
                    seed: (event.target.checked as boolean)
                      ? Math.floor(Math.random() * MAX_SEED)
                      : null
                  }
                })
              }
            />
          }
          label={t<string>('seed.randomEntries')}
        />
      </Box>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      {seed !== null && (
        <Box my={2}>
          <TextField
            type="number"
            label={t<string>('seed.ownSeed')}
            fullWidth
            value={state.seed}
            disabled={disabled}
            inputProps={{ min: 0, max: MAX_SEED - 1 }}
            onChange={(event) => setSeed(parseInt(event.target.value))}
          />
        </Box>
      )}
    </FilterContent>
  );
};
