import React, { useContext } from 'react';
import { Box, Checkbox, FormControlLabel, TextField } from '@material-ui/core';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import { useTranslation } from 'react-i18next';

import { SearchContext } from '../Search.context';
import { Types } from '../reducers';

import { FilterContent } from './FilterContent';

const MAX_SEED = 10000000;

type Props = {
  disabled?: boolean;
};

export const EntriesLimitFilter = ({ disabled }: Props) => {
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
      {state.seed !== null && (
        <Box my={2}>
          <TextField
            type="number"
            label={t<string>('seed.ownSeed')}
            fullWidth
            value={state.seed}
            disabled={disabled}
            inputProps={{ min: 0, max: MAX_SEED - 1 }}
            onChange={(event) =>
              dispatch({
                type: Types.SetSeed,
                payload: {
                  seed: parseInt(event.target.value)
                }
              })
            }
          />
        </Box>
      )}
    </FilterContent>
  );
};
