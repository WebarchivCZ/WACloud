import {
  Button,
  TextField
} from "@material-ui/core";
import ClassIcon from "@material-ui/icons/Class";
import React, {useState} from "react";
import {Autocomplete} from "@material-ui/lab";
import {FilterContent} from "./FilterContent";
import {useTranslation} from "react-i18next";
import {ValuableOptionalsProps} from "../../interfaces/ValuableOptionalsProps";

export const ThemeFilter = ({options, value, setValue, append, disabled}: ValuableOptionalsProps<string|null>) => {
  const { t } = useTranslation();
  const [input, setInput] = useState<string|undefined>("");

  const buttonClick = (positive: boolean) => () => {
    if (append) {
      append((!positive ? "NOT " : "") + "topics:\""+value+"\"");
    }
    setValue('');
  }

  return (
    <FilterContent title={t('filters.theme')} icon={<ClassIcon/>} buttons={[
      <Button variant="contained" color={'primary'} disabled={disabled || value === ''} size="small" onClick={buttonClick(true)}>=</Button>,
      <Button variant="contained" color={'primary'} disabled={disabled || value === ''} size="small" onClick={buttonClick(false)}>≠</Button>
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
        renderInput={(params) => <TextField {...params} label={t('filters.theme')} />}
      />
    </FilterContent>
  );
};
