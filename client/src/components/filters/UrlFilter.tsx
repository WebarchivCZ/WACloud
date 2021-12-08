import {
  Button, MenuItem, TextField
} from "@material-ui/core";
import HttpIcon from "@material-ui/icons/Http";
import React, {Dispatch, SetStateAction} from "react";
import {FilterContent} from "./FilterContent";
import {useTranslation} from "react-i18next";
import AddIcon from "@material-ui/icons/Add";

interface UrlFilterProps<T> {
  operator: T;
  setOperator: Dispatch<SetStateAction<T>>;
  url: T;
  setUrl: Dispatch<SetStateAction<T>>;
  append?: (appendValue: string) => void;
  disabled?: boolean;
}

export const UrlFilter = ({operator, setOperator, url, setUrl, append, disabled}: UrlFilterProps<string|null>) => {
  const { t } = useTranslation();
  const buttonClick = () => {
    if (append) {
      switch(operator) {
        case "contain":
          append("url:/.*"+url+".*/");
          break;
        case "contain-not":
          append("NOT url:/.*"+url+".*/");
          break;
        case "equal-not":
          append("NOT url:\""+url+"\"");
          break;
        default:
          append("url:\""+url+"\"");
      }
    }
    setUrl('');
  }
  return (
    <FilterContent title={t('filters.url')} icon={<HttpIcon/>} buttons={[
      <Button variant="contained" color={'primary'} disabled={disabled || !operator || !url} size="small" onClick={buttonClick}>
        <AddIcon fontSize="small"/>
      </Button>
    ]}>
      <TextField
        select
        fullWidth
        label={t('filters.operator.label')}
        value={operator}
        disabled={disabled}
        onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
          setOperator(event.target.value as string);
        }}
      >
        <MenuItem value="contain">{t('filters.operator.contain')}</MenuItem>
        <MenuItem value="contain-not">{t('filters.operator.contain-not')}</MenuItem>
        <MenuItem value="equal">{t('filters.operator.equal')}</MenuItem>
        <MenuItem value="equal-not">{t('filters.operator.equal-not')}</MenuItem>
      </TextField>
      <br/>
      <TextField
        label={t('filters.url')}
        value={url}
        disabled={disabled}
        fullWidth
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setUrl(event.target.value);
        }}
      />
    </FilterContent>
  );
};
