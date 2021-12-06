import {
  Button, InputLabel, Slider,
} from "@material-ui/core";
import SentimentVerySatisfiedIcon from "@material-ui/icons/SentimentVerySatisfied";
import React from "react";
import {FilterContent} from "./FilterContent";
import {useTranslation} from "react-i18next";
import withStyles from "@material-ui/core/styles/withStyles";
import {ValuableProps} from "../../interfaces/ValuableProps";

const ColoredSlider = withStyles(theme => ({
  root: {
    color: '#757575',
    margin: theme.spacing(0, 0.75),
    width: '94%'
  },
}))(Slider);

export const SentimentFilter = ({value, setValue, append}: ValuableProps<number|number[]>) => {
  const { t } = useTranslation();

  const buttonClick = (positive: boolean) => () => {
    if (append) {
      append((!positive ? "NOT " : "") + "sentiment:"+((value as number[]) ? "["+(value as number[])[0]+" TO "+(value as number[])[1]+"]" : value))
    }
    setValue([-1, 1]);
  }

  const buttonDisabled = (value as number[]).length === 2 && (value as number[])[0] === -1 && (value as number[])[1] === 1;

  return (
    <FilterContent title={t('filters.sentiment')} icon={<SentimentVerySatisfiedIcon/>} buttons={[
      <Button variant="contained" color={'primary'} disabled={buttonDisabled} size="small" onClick={buttonClick(true)}>=</Button>,
      <Button variant="contained" color={'primary'} disabled={buttonDisabled} size="small" onClick={buttonClick(false)}>≠</Button>
    ]}>
      <InputLabel>
        {t('filters.sentiment')}
      </InputLabel>
      <ColoredSlider
        step={0.1}
        marks
        min={-1.0}
        max={1.0}
        color="secondary"
        valueLabelDisplay="auto"
        value={value}
        onChange={(_event: any, newValue: number | number[]) => {
          setValue(newValue);
        }}
      />
    </FilterContent>
  );
};
