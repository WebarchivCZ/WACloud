import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField
} from "@material-ui/core";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import React, {Dispatch, SetStateAction} from "react";
import {FilterContent} from "./FilterContent";
import {useTranslation} from "react-i18next";
import {ValuableProps} from "../../interfaces/ValuableProps";

const MAX_SEED: number = 10000000;
type SeedProps<T> = {
  setSeed: Dispatch<SetStateAction<T>>;
  seed: T;
};

export const EntriesLimitFilter = ({value, setValue, seed, setSeed}: ValuableProps<number> & SeedProps<number|null>) => {
  const { t } = useTranslation();
  return (
    <FilterContent title={t('filters.entriesLimit')} icon={<FormatListNumberedIcon/>}>
      <Box my={2}>
      <TextField
        type="number"
        label={t('filters.entriesLimit')}
        fullWidth
        inputProps={{min: 10, max: 10000}}
        value={value}
        onChange={(event) => setValue(parseInt(event.target.value))}/>
      </Box>
      <Box my={2}>
      <FormControlLabel
        control={<Checkbox color="primary" checked={seed != null} onChange={(event) =>
          setSeed(event.target.checked as boolean ? Math.floor(Math.random()*MAX_SEED) : null)
        } />}
        label={t('seed.randomEntries')}
      />
      </Box>
      {seed != null && (
        <Box my={2}>
          <TextField type="number"
                     label={t('seed.ownSeed')}
                     fullWidth
                     value={seed}
                     inputProps={{min: 0, max: MAX_SEED-1}}
                     onChange={(event) => setSeed(parseInt(event.target.value))}
          />
        </Box>
      )}
    </FilterContent>
  );
};
