import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  TextField,
  makeStyles,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper
} from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { format } from 'date-fns'
import { IFilter } from './SearchForm';
import _ from 'lodash';
import {Autocomplete} from "@material-ui/lab";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme) => ({
  header: {
    margin: theme.spacing(0, 0, 2)
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
  },
  chipsPaper: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  chip: {
    margin: theme.spacing(0.2),
  },
  accordionHeading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  accordionSecondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
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
  const [stopWord, setStopWord] = useState<string>("");
  
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
  const handleChangeStopWord = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStopWord(event.target.value);
  };
  const handleAddStopWord = () => {
    if (stopWord.length > 0) {
      let f:IFilter = _.cloneDeep(filter);
      f.stopWords.push(stopWord);
      f.stopWords = f.stopWords.sort();
      setFilter(f);
      setStopWord("");
    }
  };
  const handleChangeIdentificators = (event: React.ChangeEvent<HTMLInputElement>) => {
    let f:IFilter = _.cloneDeep(filter);
    f.filterIdsList = event.target.value;
    setFilter(f);
  };
  const handleDeleteStopWord = (index: number) => () => {
    let f:IFilter = _.cloneDeep(filter);
    f.stopWords.splice(index, 1)
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
      <Typography variant="h5" className={classes.header}>
        DOTAZ
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {/*<Typography variant="body1" className={classes.selectLabel}>*/}
          {/*  Zatím máte složeno:*/}
          {/*</Typography>*/}
          <TextField label="Dotaz" multiline rows={2} variant="filled" style={{width: "100%"}} value={filter.filter} onChange={handleChangeFilter}/>
        </Grid>

        <Grid item xs={12}>
          <Grid container justifyContent="flex-end" spacing={1}>
            <Grid item>
              <Typography variant="body2" style={{lineHeight: 2.5}}>
                Logické operátory:
              </Typography>
            </Grid>
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
      </Grid>
    </>
  );
}

export default Filters;
