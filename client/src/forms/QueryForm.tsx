import React, { useContext, useEffect, Dispatch, SetStateAction } from 'react';
import {
  Button,
  createStyles,
  Grid,
  makeStyles,
  TextField,
  Theme,
  Typography
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { SearchContext, Stage } from '../components/Search.context';
import { ValuableProps } from '../interfaces/ValuableProps';
import { Types } from '../components/reducers';
import { ValidationObject } from '../components/dialog/types';

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
    textBold: {
      fontWeight: 'bold',
      color: '#0000ff' // Primary color
    }
  })
);

interface LogicalButtonProps {
  label: string;
  appendValue: string;
}

export const QueryForm = ({
  value,
  disabled,
  validation,
  setValidation
}: ValuableProps<string> & {
  validation: ValidationObject | undefined;
  setValidation: Dispatch<SetStateAction<ValidationObject | undefined>>;
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { state, dispatch } = useContext(SearchContext);

  useEffect(() => {
    if (state.stage === Stage.ANALYTICS) {
      fetch('/api/search/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          base: {
            filter: state.query.length === 0 ? '*:*' : state.query,
            harvests: state.harvests,
            entries: state.entriesLimit,
            stopWords: state.stopWords.map((v) => v.trim()),
            randomSeed: state.seed
          },
          queries: state.queries.map(function (x) {
            return {
              type: x.searchType,
              texts: x.queries,
              textsOpposite: x.queriesOpposite,
              contextSize: x.context ? x.contextSize : 0,
              limit: x.limit,
              useOnlyDomains: x.useOnlyDomains,
              useOnlyDomainsOpposite: x.useOnlyDomainsOpposite,
              format: 'JSON',
              sorting: []
            };
          })
        })
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error();
          }
        })
        .then((data: ValidationObject) => {
          setValidation({
            valid: data.valid,
            estimated: data.estimated
          });
        })
        .catch(() => setValidation({ valid: false, estimated: 0 }));
    }
  }, [state.stage]);

  const handleChangeFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: Types.SetQuery, payload: { query: event.target.value } });
  };

  const LogicalButton = ({ label, appendValue }: LogicalButtonProps) => (
    <Grid item>
      <Button
        size="small"
        variant="contained"
        className={classes.button}
        disabled={disabled}
        onClick={() => dispatch({ type: Types.SetQuery, payload: { query: value + appendValue } })}>
        {label}
      </Button>
    </Grid>
  );

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h2">{t<string>('query.header')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            multiline
            rows={3}
            variant="outlined"
            fullWidth
            value={value}
            disabled={disabled}
            onChange={handleChangeFilter}
          />
        </Grid>

        <Grid item xs={12}>
          <Grid
            container
            justifyContent={state.stage === Stage.ANALYTICS ? 'space-between' : 'flex-end'}
            alignItems="center"
            spacing={1}>
            {state.stage === Stage.ANALYTICS && (
              <Grid item xs={6}>
                <Typography variant="body2">
                  {t<string>('query.queryIs')}
                  <span className={classes.textBold}>
                    {validation?.valid === true
                      ? t<string>('query.valid')
                      : t<string>('query.notValid')}
                  </span>
                  {validation?.valid && (
                    <span>
                      {t<string>('query.queryProcesses')}
                      <span className={classes.textBold}>
                        {validation?.estimated}
                        {t<string>('query.entries')}
                      </span>
                    </span>
                  )}
                </Typography>
              </Grid>
            )}
            <Grid container xs={6} justifyContent="flex-end" alignItems="center" spacing={1}>
              <Typography variant="body2">{t<string>('query.operators')}</Typography>
              <LogicalButton label="AND" appendValue=" AND " />
              <LogicalButton label="OR" appendValue=" OR " />
              <LogicalButton label="NOT" appendValue=" NOT " />
              <LogicalButton label="(" appendValue="(" />
              <LogicalButton label=")" appendValue=")" />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
