import {
  Button
} from "@material-ui/core";
import DateRangeIcon from "@material-ui/icons/DateRange";
import React, {Dispatch, SetStateAction} from "react";
import {FilterContent} from "./FilterContent";
import {useTranslation} from "react-i18next";
import {KeyboardDatePicker} from "@material-ui/pickers";
import AddIcon from "@material-ui/icons/Add";
import {format} from "date-fns";

interface DateFilterProps<T> {
  from: T;
  setFrom: Dispatch<SetStateAction<T>>;
  to: T;
  setTo: Dispatch<SetStateAction<T>>;
  append?: (appendValue: string) => void;
}

export const DateFilter = ({from, setFrom, to, setTo, append}: DateFilterProps<Date|null>) => {
  const { t } = useTranslation();
  const buttonClick = () => {
    if (append) {
      append("date:["+format(from ? from : 0, "yyyy-MM-dd")+"T00:00:00Z TO "+format(to ? to : 0, "yyyy-MM-dd")+"T00:00:00Z]")
    }
    setFrom(null)
    setTo(null);
  }
  return (
    <FilterContent title={t('filters.date')} icon={<DateRangeIcon/>} buttons={[
      <Button variant="contained" color={'primary'} disabled={!from && !to} size="small" onClick={buttonClick}>
        <AddIcon fontSize="small"/>
      </Button>
    ]}>
      <KeyboardDatePicker
        disableToolbar
        variant="inline"
        format="dd.MM.yyyy"
        margin="normal"
        autoOk={true}
        label={t('filters.dateFrom')}
        value={from}
        style={{margin: 0}}
        onChange={(date: Date | null) => {
          setFrom(date);
        }}
      />
      <br/>
      <KeyboardDatePicker
        disableToolbar
        variant="inline"
        format="dd.MM.yyyy"
        margin="normal"
        autoOk={true}
        label={t('filters.dateTo')}
        value={to}
        style={{margin: 0}}
        onChange={(date: Date | null) => {
          setTo(date);
        }}
      />
    </FilterContent>
  );
};
