import React, { useState, useEffect } from 'react';
import { Grid, Container, CssBaseline, Typography, TextField, makeStyles, Fab, FormControl, InputLabel, Select, MenuItem, Slider } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { format } from 'date-fns'
import './App.css';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: `theme.spacing(3) auto`
  },
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

function App() {
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
  const [pageType, setPageType] = useState<string | null>("");
  const [urlSelect, setUrlSelect] = useState<string | null>("contain");
  const [url, setUrl] = useState<string | null>("");
  const [filter, setFilter] = useState<string | null>("");
  const [topics, setTopics] = useState<string[]>([]);
  const [webTypes, setWebTypes] = useState<string[]>([]);
  
  const appendFilter = (text: string) => {
    setFilter(filter + text);
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
  const handleThemeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTheme(event.target.value as string);
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
    setFilter(event.target.value);
  };
  
  const handleAppendUrl = () => {
    switch(urlSelect) {
      case "contain":
        appendFilter("url:\""+url+"\"");
        break;
      case "contain-not":
        appendFilter("NOT url:\""+url+"\"");
        break;
      case "equal-not":
        appendFilter("NOT url:\"^"+url+"$\"");
        break;
      default:
        appendFilter("url:\"^"+url+"$\"");
    }
  };
  
  useEffect(() => {
    fetch("/api/topics")
      .then(res => res.json())
      .then(
        (result) => {
          setTopics(result);
        },
        (_error) => {
          setTopics([]);
        }
      )
    fetch("/api/web-types")
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
  	<MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Container className={classes.root}>
        <CssBaseline/>
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
                <Fab variant="extended" onClick={() => appendFilter("date:["+format(selectedDateFrom ? selectedDateFrom : 0, "dd.MM.yyyy")+" TO "+format(selectedDateTo ? selectedDateTo : 0, "dd.MM.yyyy")+"]")}>Vložit</Fab>
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
            </Grid>
          </Grid>
          <Grid item md={6} xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography variant="body1" className={classes.selectLabel}>
                  Typ sklizne:
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <FormControl style={{width: "100%"}}>
                  <InputLabel id="harvest-type-label">Typ sklizne</InputLabel>
                  <Select
                    labelId="harvest-type-label"
                    id="harvest-type"
                    value={harvestType}
                    onChange={handleHarvestTypeChange}
                  >
                    <MenuItem value="partial">častečná</MenuItem>
                    <MenuItem value="full">plná</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4} >
                <Grid container justify="center" spacing={1}>
                  <Grid item>
                    <Fab size="small" onClick={() => appendFilter("harvestType:\""+harvestType+"\"")}>=</Fab>
                  </Grid>
                  <Grid item>
                    <Fab size="small" onClick={() => appendFilter("NOT harvestType:\""+harvestType+"\"")}>≠</Fab>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

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
                  <InputLabel id="theme-label">Téma</InputLabel>
                  <Select
                    labelId="theme-label"
                    id="theme"
                    value={theme}
                    onChange={handleThemeChange}
                  >
                    {topics.map((value, index) => {
                      return  <MenuItem key={value} value={value}>{value}</MenuItem>
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4} >
                <Grid container justify="center" spacing={1}>
                  <Grid item>
                    <Fab size="small" onClick={() => appendFilter("theme:\""+theme+"\"")}>=</Fab>
                  </Grid>
                  <Grid item>
                    <Fab size="small" onClick={() => appendFilter("NOT theme:\""+theme+"\"")}>≠</Fab>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

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
                    {webTypes.map((value, index) => {
                      return  <MenuItem key={value} value={value}>{value}</MenuItem>
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4} >
                <Grid container justify="center" spacing={1}>
                  <Grid item>
                    <Fab size="small" onClick={() => appendFilter("pageType:\""+pageType+"\"")}>=</Fab>
                  </Grid>
                  <Grid item>
                    <Fab size="small" onClick={() => appendFilter("NOT pageType:\""+pageType+"\"")}>≠</Fab>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body1" className={classes.selectLabel}>
              Zatím máte složeno:
            </Typography>
            <TextField label="Filter" style={{width: "100%"}} value={filter} onChange={handleChangeFilter}/>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body1" className={classes.selectLabel}>
              Textové zadání identifikatoru:
            </Typography>
            <TextField label="Identifikator" style={{width: "100%"}} multiline={true} />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body1" className={classes.selectLabel}>
              Počet náhodně vybraných záznamů: 
              <TextField label="počet" type="number" className={classes.urlSelect} style={{width: "20%"}}/>
            </Typography>
          </Grid>
          
          <Grid item xs={12} justify="flex-end" style={{textAlign: "right", paddingRight: "2rem"}}>
            <Fab variant="extended" color="primary">Vyhledat</Fab>
          </Grid>
    	  </Grid>
  	 </Container>
    </MuiPickersUtilsProvider>
  );
}

export default App;
