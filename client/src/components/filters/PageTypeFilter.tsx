import {
  Button, MenuItem, TextField,
} from "@material-ui/core";
import DvrIcon from "@material-ui/icons/Dvr";
import React from "react";
import {FilterContent} from "./FilterContent";
import {useTranslation} from "react-i18next";
import {ValuableOptionalsProps} from "../../interfaces/ValuableOptionalsProps";

export const PageTypeFilter = ({options, value, setValue, append}: ValuableOptionalsProps<string|undefined>) => {
  const { t } = useTranslation();

  const buttonClick = (positive: boolean) => () => {
    if (append) {
      append((!positive ? "NOT " : "") + "webType:\""+value+"\"");
    }
    setValue('');
  }

  return (
    <FilterContent title={t('filters.pageType')} icon={<DvrIcon/>} buttons={[
      <Button variant="contained" color={'primary'} disabled={value === ''} size="small" onClick={buttonClick(true)}>=</Button>,
      <Button variant="contained" color={'primary'} disabled={value === ''} size="small" onClick={buttonClick(false)}>≠</Button>
    ]}>
      <TextField
        select
        fullWidth
        label={t('filters.pageType')}
        value={value}
        onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
          setValue(event.target.value as string);
        }}
      >
        {options.map((v) => {
          return  <MenuItem key={v} value={v}>{v}</MenuItem>
        })}
      </TextField>
    </FilterContent>
  );
};
