import React from 'react';
import {
  Grid,
  makeStyles,
  MenuItem,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Paper,
  Box,
  Button, Chip
} from '@material-ui/core';
import _ from 'lodash';
import AddIcon from '@material-ui/icons/Add';
import {useTranslation} from "react-i18next";
import IQuery from "../interfaces/IQuery";

const useStyles = makeStyles((theme) => ({
  header: {
    margin: theme.spacing(0, 0, 2)
  },
  chip: {
    margin: theme.spacing(0.5)
  },
  chipRoot: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: theme.spacing(0.5),
    margin: 0,
  }
}));

//enum QueryType {Frequency, Colocation, Occurence}

function AnalyticQueriesForm({queries, setQueries}:{queries:IQuery[], setQueries:(queries: IQuery[]) => any}) {
  const { t } = useTranslation();
	const classes = useStyles();
  
  const handleQueryTypeChange = (index: number, event: React.ChangeEvent<{ value: unknown }>) => {
    let q:IQuery[] = _.cloneDeep(queries);
    q[index].searchType = event.target.value as string;
    setQueries(q);
  };
  
  const handleChangeSearchText = (index: number, event: React.ChangeEvent<{ value: unknown }>) => {
    let q:IQuery[] = _.cloneDeep(queries);
    q[index].searchText = event.target.value as string;
    setQueries(q);
  };

  const handleChangeContext = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    let q:IQuery[] = _.cloneDeep(queries);
    q[index].context = event.target.checked as boolean;
    setQueries(q);
  };

  const handleChangeContextLength = (index: number, event: React.ChangeEvent<{ value: unknown }>) => {
    let q:IQuery[] = _.cloneDeep(queries);
    q[index].contextSize = event.target.value as number;
    setQueries(q);
  };

  const handleChangeLimit = (index: number, event: React.ChangeEvent<{ value: string }>) => {
    let q:IQuery[] = _.cloneDeep(queries);
    q[index].limit = parseInt(event.target.value);
    setQueries(q);
  };
  
  const handleDeleteQueryText = (index: number, ind: number) => {
    let q:IQuery[] = _.cloneDeep(queries);
    q[index].queries.splice(ind, 1);
    setQueries(q);
  };
  
  const handleAddQueryText = (index: number) => {
    if (queries[index].searchText.length > 0) {
      let q:IQuery[] = _.cloneDeep(queries);
      q[index].queries.push(q[index].searchText);
      q[index].searchText = "";
      setQueries(q);
    }
  };
  
  const handleAddQuery = () => {
    let q:IQuery[] = _.cloneDeep(queries);
    q.push({queries: [], query: "", context: false, searchText: "", searchType: "", limit: 10});
    setQueries(q);
  };
  
  const handleDeleteQuery = (index: number) => {
    let q:IQuery[] = _.cloneDeep(queries);
    q.splice(index, 1);
    setQueries(q);
  };
  
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="h2">
            {t('analytics.title')}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button variant="contained" size="large" color="primary" onClick={handleAddQuery}>
                {t('analytics.add')}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {queries.map((query, index) => (
        <Box my={2}>
          <Paper>
            <Box p={2}>
              <Grid container spacing={2} key={index}>
                <Grid item md={2} xs={12}>
                  <TextField select
                             label={t('analytics.queryType')}
                             fullWidth
                             value={query.searchType}
                             onChange={(event) => handleQueryTypeChange(index, event)}>
                    <MenuItem value="FREQUENCY">Frequency</MenuItem>
                    <MenuItem value="COLLOCATION">Colocation</MenuItem>
                    {/*<MenuItem value="OCCURENCE">Occurence</MenuItem>*/}
                    <MenuItem value="RAW">Raw</MenuItem>
                  </TextField>
                </Grid>
                <Grid item md={4} xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={t('analytics.wordInput')}
                        value={query.searchText}
                        onChange={(event) => handleChangeSearchText(index, event)}
                        onKeyDown={(event) => { if(event.keyCode === 13) handleAddQueryText(index) }}
                      />
                    </Grid>

                    {query.searchType === "COLLOCATION" && (
                      <>
                        <Grid item xs={6}>
                          <FormControlLabel
                            control={<Checkbox color="primary" checked={query.context} onChange={(event) => handleChangeContext(index, event)} />}
                            label={t('analytics.context')}
                          />
                        </Grid>

                        {query.context && (
                          <Grid item xs={6}>
                            <TextField
                              type="number"
                              fullWidth
                              label={t('analytics.contextLength')}
                              value={query.contextSize}
                              onChange={(event) => handleChangeContextLength(index, event)}
                            />
                          </Grid>
                        )}
                      </>
                    )}

                    {(query.searchType === "RAW" || query.searchType === "FREQUENCY") && (
                      <>
                        <Grid item xs={6}>
                          <TextField type="number"
                                     label={t('filters.entriesLimit')}
                                     fullWidth
                                     value={query.limit}
                                     inputProps={{min: 1, max: 1000}}
                                     onChange={(event) => handleChangeLimit(index, event)}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Grid>
                
                <Grid item xs={12} md={1}>
                  <Button variant="contained" color="primary" onClick={() => { handleAddQueryText(index) }}
                          style={{width: '40px', height: '40px', margin: '0px', padding: '0px', minWidth: '40px'}}>
                    <AddIcon fontSize="small"/>
                  </Button>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="body1">
                    {t('analytics.words')}
                  </Typography>
                  <Box component="ul" className={classes.chipRoot}>
                      {query.queries.map((q, ind) => (
                        <li key={ind}>
                          <Chip
                            label={q}
                            onDelete={() => handleDeleteQueryText(index, ind)}
                            className={classes.chip}
                          />
                        </li>
                      ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={1} justify="flex-end" style={{textAlign: "right", paddingRight: "2rem"}}>
                  <Button color="secondary" variant="contained" onClick={() => handleDeleteQuery(index)}>
                    {t('analytics.delete')}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      ))}
    </>
  );
}

export default AnalyticQueriesForm;
