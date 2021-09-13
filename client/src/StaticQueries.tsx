import React from 'react';
import { Grid, makeStyles, Fab, FormControl, InputLabel, Select, MenuItem, Typography, TextField, Checkbox, FormControlLabel, List, ListItem, ListItemSecondaryAction, ListItemText, IconButton, Paper, Box } from '@material-ui/core';
import _ from 'lodash';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { IQuery } from './SearchForm';

const useStyles = makeStyles((theme) => ({
  header: {
    margin: theme.spacing(3, 0)
  },
}));


//enum QueryType {Frequency, Colocation, Occurence}

function StaticQueries({queries, setQueries}:{queries:IQuery[], setQueries:(queries: IQuery[]) => any}) {
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
    q.push({queries: [], query: "", context: false, searchText: "", searchType: ""});
    setQueries(q);
  };
  
  const handleDeleteQuery = (index: number) => {
    let q:IQuery[] = _.cloneDeep(queries);
    q.splice(index, 1);
    setQueries(q);
  };
  
  return (
    <>
      <Typography variant="h4" className={classes.header}>
        2 STATICKÉ DOTAZY
      </Typography>
      {queries.map((query, index) => (
        <Box my={2}>
          <Paper>
            <Box p={2}>
              <Grid container spacing={2} key={index}>
                <Grid item md={2} xs={12}>
                  <FormControl style={{width: "100%"}}>
                    <InputLabel id="query-type">Typ dotazu</InputLabel>
                    <Select
                      labelId="query-type-label"
                      id="query-type"
                      value={query.searchType}
                      onChange={(event) => handleQueryTypeChange(index, event)}
                    >
                      {/*<MenuItem value="FREQUENCY">Frequency</MenuItem>*/}
                      <MenuItem value="COLLOCATION">Colocation</MenuItem>
                      {/*<MenuItem value="OCCURENCE">Occurence</MenuItem>*/}
                      <MenuItem value="RAW">Raw</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item md={5} xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl style={{width: "100%"}}>
                        <TextField 
                          label="Zadejte text pro vyhledávaní" 
                          value={query.searchText}
                          onChange={(event) => handleChangeSearchText(index, event)}
                          onKeyDown={(event) => { if(event.keyCode === 13) handleAddQueryText(index) }}
                        />
                      </FormControl>
                    </Grid>

                    {query.searchType === "COLLOCATION" && (
                      <>
                        <Grid item xs={5}>
                          <FormControlLabel
                            control={<Checkbox color="primary" checked={query.context} onChange={(event) => handleChangeContext(index, event)} />}
                            label="Přidat kontext"
                          />
                        </Grid>

                        <Grid item xs={7}>
                          <FormControlLabel
                            control={<TextField label="počet" type="number" value={query.contextSize} onChange={(event) => handleChangeContextLength(index, event)} />}
                            label="Počet slov kontextu"
                            labelPlacement="start"
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Grid>
                
                <Grid item xs={12} md={1}>
                  <Fab variant="extended" onClick={() => { handleAddQueryText(index) }}>Přidat</Fab>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Typography variant="body1">
                    Seznam vyrazů
                  </Typography>
                  <Paper>
                    <List>
                      {query.queries.map((q, ind) => (
                        <ListItem key={ind} dense>
                          <ListItemText primary={q} />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="comments" onClick={() => handleDeleteQueryText(index, ind)}>
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={1} justify="flex-end" style={{textAlign: "right", paddingRight: "2rem"}}>
                  <Fab color="primary" onClick={() => handleDeleteQuery(index)}><DeleteIcon/></Fab>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      ))}
      <Grid item xs={12}>
        <Fab color="primary" onClick={handleAddQuery}><AddIcon/></Fab> Přidat další dotaz
      </Grid>
    </>
  );
}

export default StaticQueries;
