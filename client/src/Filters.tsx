import React, { useState, useEffect } from 'react';
import { Grid, Typography, TextField, makeStyles, Fab, FormControl, InputLabel, Select, MenuItem, Slider } from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { format } from 'date-fns'
import { IFilter } from './SearchForm';
import _ from 'lodash';
import {Autocomplete} from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
  header: {
    margin: theme.spacing(3, 0)
  },
  dates: {
    margin: theme.spacing(0, 1)
  },
  datesText: {
    lineHeight: 2
  },
  selectLabel: {
    padding: "1.5rem 0 0"
  },
  urlSelect: {
    width: "60%",
    position: "relative",
    top: "-23px",
    left: "10px"
  }
}));

function Filters({filter, setFilter}:{filter:IFilter, setFilter:(filter:IFilter) => any}) {
	const classes = useStyles();
	
  const [selectedDateFrom, setSelectedDateFrom] = useState<Date | null>(
    new Date(),
  );
  const [selectedDateTo, setSelectedDateTo] = useState<Date | null>(
    new Date(),
  );
  const [harvestType, setHarvestType] = useState<string | null>("");
  const [sentiment, setSentiment] = useState<number | number[]>([-1,1]);
  const [theme, setTheme] = useState<string | null>("");
  const [inputTheme, setInputTheme] = useState<string | undefined>("");
  const [pageType, setPageType] = useState<string | undefined>("");
  const [urlSelect, setUrlSelect] = useState<string | null>("contain");
  const [url, setUrl] = useState<string | null>("");
  const [link, setLink] = useState<string | null>("");
  const [headline, setHeadline] = useState<string | null>("");
  const [plaintext, setPlaintext] = useState<string | null>("");
  const [topics, setTopics] = useState<string[]>([]);
  const [webTypes, setWebTypes] = useState<string[]>([]);
  
  const appendFilter = (text: string) => {
    let f:IFilter = _.cloneDeep(filter);
    f.filter = f.filter + text;
    setFilter(f);
  };

  const handleDateFromChange = (date: Date | null) => {
    setSelectedDateFrom(date);
  };
  const handleDateToChange = (date: Date | null) => {
    setSelectedDateTo(date);
  };
  const handleHarvestTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setHarvestType(event.target.value as string);
  };
  const handleSentimentChange = (_event: any, newValue: number | number[]) => {
    setSentiment(newValue);
  };
  const handlePageTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setPageType(event.target.value as string);
  };
  const handleUrlSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setUrlSelect(event.target.value as string);
  };
  const handleChangeUrl = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };
  const handleChangeFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    let f:IFilter = _.cloneDeep(filter);
    f.filter = event.target.value;
    setFilter(f);
  };
  const handleChangeIdentificators = (event: React.ChangeEvent<HTMLInputElement>) => {
    let f:IFilter = _.cloneDeep(filter);
    f.filterIdsList = event.target.value;
    setFilter(f);
  };
  const handleChangeRecords = (event: React.ChangeEvent<HTMLInputElement>) => {
    let f:IFilter = _.cloneDeep(filter);
    f.filterRandomSize = parseInt(event.target.value);
    if (f.filterRandomSize > 1000) f.filterRandomSize = 1000;
    if (f.filterRandomSize < 10) f.filterRandomSize = 10;
    setFilter(f);
  };
  
  const handleAppendUrl = () => {
    switch(urlSelect) {
      case "contain":
        appendFilter("url:/.*"+url+".*/");
        break;
      case "contain-not":
        appendFilter("NOT url:/.*"+url+".*/");
        break;
      case "equal-not":
        appendFilter("NOT url:\""+url+"\"");
        break;
      default:
        appendFilter("url:\""+url+"\"");
    }
  };
  
  useEffect(() => {
    fetch("/api/topic")
      .then(res => res.json())
      .then(
        (result) => {
          setTopics(result);
        },
        (_error) => {
          setTopics([]);
        }
      )
    fetch("/api/webtype")
      .then(res => res.json())
      .then(
        (result) => {
          setWebTypes(result);
        },
        (_error) => {
          setWebTypes([]);
        }
      )
  }, [])
  
  return (
  	<>
      <Typography variant="h4" className={classes.header}>
        1 ZADEJTE PARAMETRY PRO FILTROVÁNÍ
      </Typography>
  	  <Grid container spacing={2}>
        <Grid item md={6} xs={12}>
          <Grid container spacing={1}>
            <Grid item md={6} xs={12}>
              <Typography variant="body1">
                Logické operátory
              </Typography>
            </Grid>
            <Grid item md={6} xs={12}>
              <Grid container justify="center" spacing={1}>
                <Grid item>
                  <Fab size="small" onClick={() => appendFilter(" AND ")}>AND</Fab>
                </Grid>
                <Grid item>
                  <Fab size="small" onClick={() => appendFilter(" OR ")}>OR</Fab>
                </Grid>
                <Grid item>
                  <Fab size="small" onClick={() => appendFilter(" NOT ")}>NOT</Fab>
                </Grid>
                <Grid item>
                  <Fab size="small" onClick={() => appendFilter("(")}>(</Fab>
                </Grid>
                <Grid item>
                  <Fab size="small" onClick={() => appendFilter(")")}>)</Fab>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                Datum sklizne
              </Typography>
            </Grid>
            <Grid item xs={9}>
              <Typography variant="body1" className={classes.datesText}>
                Od:
                <KeyboardDatePicker
                  disableToolbar
                  variant="inline"
                  format="dd.MM.yyyy"
                  margin="normal"
                  value={selectedDateFrom}
                  onChange={handleDateFromChange}
                  className={classes.dates}
                />
              </Typography>
              <Typography variant="body1" className={classes.datesText}>
                Do:
                <KeyboardDatePicker
                  disableToolbar
                  variant="inline"
                  format="dd.MM.yyyy"
                  margin="normal"
                  value={selectedDateTo}
                  onChange={handleDateToChange}
                  className={classes.dates}
                />
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Fab variant="extended" onClick={() => appendFilter("date:["+format(selectedDateFrom ? selectedDateFrom : 0, "yyyy-MM-dd")+"T00:00:00Z TO "+format(selectedDateTo ? selectedDateTo : 0, "yyyy-MM-dd")+"T00:00:00Z]")}>Vložit</Fab>
            </Grid>
            
            <Grid item xs={4}>
              <Typography variant="body1" className={classes.selectLabel}>
                URL:
                <FormControl className={classes.urlSelect}>
                  <InputLabel id="url-operator-label">Operator</InputLabel>
                  <Select
                    labelId="url-operator-label"
                    id="url-operator"
                    value={urlSelect}
                    onChange={handleUrlSelectChange}
                  >
                    <MenuItem value="contain">obsahuje</MenuItem>
                    <MenuItem value="contain-not">neobsahuje</MenuItem>
                    <MenuItem value="equal">rovna se</MenuItem>
                    <MenuItem value="equal-not">nerovna se</MenuItem>
                  </Select>
                </FormControl>
              </Typography>
            </Grid>
            <Grid item xs={5}>
              <TextField 
                label="URL" 
                value={url}
                onChange={handleChangeUrl}
              />
            </Grid>
            <Grid item xs={3} >
              <Fab variant="extended" onClick={handleAppendUrl}>Vložit</Fab>
            </Grid>

            {/*<Grid item xs={4}>*/}
            {/*  <Typography variant="body1" className={classes.selectLabel}>*/}
            {/*    Odkaz (obsahuje):*/}
            {/*  </Typography>*/}
            {/*</Grid>*/}
            {/*<Grid item xs={5}>*/}
            {/*  <TextField*/}
            {/*    label="Link"*/}
            {/*    value={link}*/}
            {/*    onChange={(event) => setLink(event.target.value)}*/}
            {/*  />*/}
            {/*</Grid>*/}
            {/*<Grid item xs={3} >*/}
            {/*  <Fab variant="extended" onClick={() => appendFilter("links:\""+link+"\"")}>Vložit</Fab>*/}
            {/*</Grid>*/}

            {/*<Grid item xs={4}>*/}
            {/*  <Typography variant="body1" className={classes.selectLabel}>*/}
            {/*    Nadpis:*/}
            {/*  </Typography>*/}
            {/*</Grid>*/}
            {/*<Grid item xs={5}>*/}
            {/*  <TextField*/}
            {/*    label="Nadpis"*/}
            {/*    value={headline}*/}
            {/*    onChange={(event) => setHeadline(event.target.value)}*/}
            {/*  />*/}
            {/*</Grid>*/}
            {/*<Grid item xs={3} >*/}
            {/*  <Fab variant="extended" onClick={() => appendFilter("headlines:\""+headline+"\"")}>Vložit</Fab>*/}
            {/*</Grid>*/}
          </Grid>
        </Grid>
        <Grid item md={6} xs={12}>
          {/*<Grid container spacing={1}>*/}
          {/*  <Grid item xs={4}>*/}
          {/*    <Typography variant="body1" className={classes.selectLabel}>*/}
          {/*      Typ sklizne:*/}
          {/*    </Typography>*/}
          {/*  </Grid>*/}
          {/*  <Grid item xs={4}>*/}
          {/*    <FormControl style={{width: "100%"}}>*/}
          {/*      <InputLabel id="harvest-type-label">Typ sklizne</InputLabel>*/}
          {/*      <Select*/}
          {/*        labelId="harvest-type-label"*/}
          {/*        id="harvest-type"*/}
          {/*        value={harvestType}*/}
          {/*        onChange={handleHarvestTypeChange}*/}
          {/*      >*/}
          {/*        <MenuItem value="partial">častečná</MenuItem>*/}
          {/*        <MenuItem value="full">plná</MenuItem>*/}
          {/*      </Select>*/}
          {/*    </FormControl>*/}
          {/*  </Grid>*/}
          {/*  <Grid item xs={4} >*/}
          {/*    <Grid container justify="center" spacing={1}>*/}
          {/*      <Grid item>*/}
          {/*        <Fab size="small" onClick={() => appendFilter("harvestType:\""+harvestType+"\"")}>=</Fab>*/}
          {/*      </Grid>*/}
          {/*      <Grid item>*/}
          {/*        <Fab size="small" onClick={() => appendFilter("NOT harvestType:\""+harvestType+"\"")}>≠</Fab>*/}
          {/*      </Grid>*/}
          {/*    </Grid>*/}
          {/*  </Grid>*/}
          {/*</Grid>*/}

          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Typography variant="body1" className={classes.selectLabel}>
                Sentiment:
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <FormControl style={{width: "100%", marginTop: "1rem"}}>
                <Slider
                  step={0.1}
                  marks
                  min={-1.0}
                  max={1.0}
                  valueLabelDisplay="auto"
                  value={sentiment}
                  onChange={handleSentimentChange}
                />
              </FormControl>
            </Grid>
            <Grid item xs={4} >
              <Grid container justify="center" spacing={1}>
                <Grid item>
                  <Fab size="small" onClick={() => appendFilter("sentiment:"+((sentiment as number[]) ? "["+(sentiment as number[])[0]+" TO "+(sentiment as number[])[1]+"]" : sentiment))}>=</Fab>
                </Grid>
                <Grid item>
                  <Fab size="small" onClick={() => appendFilter("NOT sentiment:"+((sentiment as number[]) ? "["+(sentiment as number[])[0]+" TO "+(sentiment as number[])[1]+"]" : sentiment))}>≠</Fab>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Typography variant="body1" className={classes.selectLabel}>
                Téma:
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <FormControl style={{width: "100%"}}>
                <Autocomplete
                  id="theme"
                  value={theme}
                  onChange={(event, newValue) => {
                    setTheme(newValue);
                  }}
                  inputValue={inputTheme}
                  onInputChange={(event, newValue) => {
                    setInputTheme(newValue);
                  }}
                  options={topics.sort((a, b) => -b.toLowerCase().localeCompare(a.toLowerCase()))}
                  groupBy={(option) => option.toLowerCase().charAt(0)}
                  renderInput={(params) => <TextField {...params} label="Téma" />}
                />
              </FormControl>
            </Grid>
            <Grid item xs={4} >
              <Grid container justify="center" spacing={1}>
                <Grid item>
                  <Fab size="small" onClick={() => appendFilter("topics:\""+theme+"\"")}>=</Fab>
                </Grid>
                <Grid item>
                  <Fab size="small" onClick={() => appendFilter("NOT topics:\""+theme+"\"")}>≠</Fab>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/*<Grid container spacing={1}>*/}
          {/*  <Grid item xs={4}>*/}
          {/*    <Typography variant="body1" className={classes.selectLabel}>*/}
          {/*      Text:*/}
          {/*    </Typography>*/}
          {/*  </Grid>*/}
          {/*  <Grid item xs={5}>*/}
          {/*    <TextField*/}
          {/*      label="Text"*/}
          {/*      value={plaintext}*/}
          {/*      onChange={(event) => setPlaintext(event.target.value)}*/}
          {/*    />*/}
          {/*  </Grid>*/}
          {/*  <Grid item xs={3} >*/}
          {/*    <Fab variant="extended" onClick={() => appendFilter("plainText:\""+plaintext+"\"")}>Vložit</Fab>*/}
          {/*  </Grid>*/}
          {/*</Grid>*/}

          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Typography variant="body1" className={classes.selectLabel}>
                Typ stránky:
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <FormControl style={{width: "100%"}}>
                <InputLabel id="page-type-label">Typ stránky</InputLabel>
                <Select
                  labelId="page-type-label"
                  id="page-type"
                  value={pageType}
                  onChange={handlePageTypeChange}
                >
                  {webTypes.map((value) => {
                    return  <MenuItem key={value} value={value}>{value}</MenuItem>
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <Grid container justify="center" spacing={1}>
                <Grid item>
                  <Fab size="small" onClick={() => appendFilter("webType:\""+pageType+"\"")}>=</Fab>
                </Grid>
                <Grid item>
                  <Fab size="small" onClick={() => appendFilter("NOT webType:\""+pageType+"\"")}>≠</Fab>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12} style={{margin: '2rem 0'}}>
          <Typography variant="body1" className={classes.selectLabel}>
            Zatím máte složeno:
          </Typography>
          <TextField label="Filter" style={{width: "100%"}} value={filter.filter} onChange={handleChangeFilter}/>
        </Grid>
        
        {/*<Grid item xs={12}>*/}
        {/*  <Typography variant="body1" className={classes.selectLabel}>*/}
        {/*    Textové zadání identifikatoru:*/}
        {/*  </Typography>*/}
        {/*  <TextField label="Identifikator" style={{width: "100%"}} multiline={true} value={filter.filterIdsList} onChange={handleChangeIdentificators}/>*/}
        {/*</Grid>*/}
        
        <Grid item xs={12} justify="flex-end" style={{textAlign: "right"}}>
          <Typography variant="body1" className={classes.selectLabel}>
            Počet {/*náhodně vybraných*/} záznamů:
            <TextField label="počet" inputProps={{min: 10, max: 1000}} type="number" className={classes.urlSelect} style={{width: "20%"}} value={filter.filterRandomSize} onChange={handleChangeRecords}/>
          </Typography>
        </Grid>
  	  </Grid>
    </>
  );
}

export default Filters;
