import {
  TextField
} from "@material-ui/core";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import React from "react";
import {FilterContent} from "./FilterContent";
import {useTranslation} from "react-i18next";
import {ValuableProps} from "../../interfaces/ValuableProps";

export const EntriesLimitFilter = ({value, setValue}: ValuableProps<number>) => {
  const { t } = useTranslation();
  return (
    <FilterContent title={t('filters.entriesLimit')} icon={<FormatListNumberedIcon/>}>
      <TextField
        type="number"
        fullWidth
        inputProps={{min: 10, max: 1000}}
        value={value}
        onChange={(event) => setValue(parseInt(event.target.value))}/>
    </FilterContent>
  );
};
