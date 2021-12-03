import {Button, createStyles, Grid, makeStyles, TextField, Theme, Typography} from "@material-ui/core";
import React from "react";
import {useTranslation} from "react-i18next";
import {ValuableProps} from "../interfaces/ValuableProps";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      minWidth: '40px',
      width: '40px',
      height: '40px',
      borderRadius: 0,
      padding: 0,
      boxShadow: 'none',
      color: theme.palette.primary.main,
      fontSize: '12px',
      fontWeight: 700
    },
  }),
);

interface LogicalButtonProps {
  label: string,
  appendValue: string
}

export const QueryForm = ({value, setValue}: ValuableProps<string>) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const handleChangeFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const LogicalButton = ({label, appendValue}: LogicalButtonProps) => (
    <Grid item>
      <Button size="small"
              variant="contained"
              className={classes.button}
              onClick={() => setValue(value+appendValue)}>
        {label}
      </Button>
    </Grid>
  )

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h2">
            {t('query.header')}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField multiline
                     rows={3}
                     variant="outlined"
                     fullWidth
                     value={value}
                     onChange={handleChangeFilter}/>
        </Grid>

        <Grid item xs={12}>
          <Grid container justifyContent="flex-end" alignItems="center" spacing={1}>
            <Grid item>
              <Typography variant="body2">
                {t('query.operators')}
              </Typography>
            </Grid>
            <LogicalButton label="AND" appendValue=" AND "/>
            <LogicalButton label="OR" appendValue=" OR "/>
            <LogicalButton label="NOT" appendValue=" NOT "/>
            <LogicalButton label="(" appendValue="("/>
            <LogicalButton label=")" appendValue=")"/>

          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
