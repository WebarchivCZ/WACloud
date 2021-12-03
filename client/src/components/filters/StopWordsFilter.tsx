import {
  Button, Typography,
} from "@material-ui/core";
import SpellcheckIcon from "@material-ui/icons/Spellcheck";
import React from "react";
import {FilterContent} from "./FilterContent";
import {useTranslation} from "react-i18next";
import EditIcon from "@material-ui/icons/Edit";
import {ValuableProps} from "../../interfaces/ValuableProps";

export const StopWordsFilter = ({value, setValue}: ValuableProps<string[]>) => {
  // TODO use setValue
  const { t } = useTranslation();
  return (
    <FilterContent title={t('filters.stopWords')} icon={<SpellcheckIcon/>} buttons={[
      <Button variant="outlined" color="default" size="small">
        <EditIcon fontSize="small"/>
      </Button>
    ]}>
      <Typography variant="body2" style={{whiteSpace: 'break-spaces'}}>{value.slice(0, 8).join(", ") + (value.length > 8 ? ",..." : "")}</Typography>
    </FilterContent>
  );
};
