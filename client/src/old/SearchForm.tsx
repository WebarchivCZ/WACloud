import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import {
  Grid,
  Fab,
  Snackbar,
  AppBar,
  makeStyles,
  Theme,
  createStyles,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  InputLabel,
  Select,
  FormControl, TextField, Slider, AccordionSummary, ListSubheader, ListItemSecondaryAction
} from '@material-ui/core';
import Filters from './Filters';
import AnalyticQueriesForm from '../forms/AnalyticQueriesForm';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import stopWordsCzech from "../config/stopWords";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {AccountCircle, Add} from "@material-ui/icons";
import DateRangeIcon from '@material-ui/icons/DateRange';
import {KeyboardDatePicker} from "@material-ui/pickers";
import HttpIcon from '@material-ui/icons/Http';
import SentimentVerySatisfiedIcon from '@material-ui/icons/SentimentVerySatisfied';
import SpellcheckIcon from '@material-ui/icons/Spellcheck';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import ClassIcon from '@material-ui/icons/Class';
import DvrIcon from '@material-ui/icons/Dvr';
import _ from "lodash";
import {format} from "date-fns";
import {Autocomplete} from "@material-ui/lab";
import logoNk from "../images/nk-logo.svg";
import logoWebArchive from "../images/webarchiv-logo.svg";


export interface IQuery {
  searchType: string,
  searchText: string,
  queries: string[],
  query: string,
  context: boolean,
  contextSize?: number,
  lim?: number
}

export interface IFilter {
  filter: string,
  filterIdsList: string,
  stopWords: string[],
  filterRandomSize?: number
}

const drawerWidth = 350;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1,
    },
    root: {
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    logoNK: {
      maxHeight: "1.7rem"
    },
    logoWA: {
      maxHeight: "64px"
    },
    logoWebarchiv: {
      fontFamily: '"Times New Roman", Times, serif',
      position: 'relative',
      color: theme.palette.primary.main
    },
    hide: {
      display: 'none',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    drawerBody: {
      width: drawerWidth - theme.spacing(1),
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      width: theme.spacing(7) + 1,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(8) + 1,
      },
    },
    drawerListIcon: {
      display: 'block',
      marginRight: theme.spacing(1),
    },
    drawerListIconMargin: {
      marginLeft: theme.spacing(1),
    },
    drawerListFab: {
      marginTop: theme.spacing(1),
    },
    fullWidth: {
      width: "100%"
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
    dates: {
      margin: theme.spacing(0, 1, 0, 0)
    },
    datesText: {
      lineHeight: 2
    },
    secondaryAction: {
      paddingRight: theme.spacing(9)
    },
    secondaryActionWider: {
      paddingRight: theme.spacing(15)
    },
    secondaryActionBox: {
      paddingBottom: theme.spacing(1)
    }
  }),
);

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function SearchForm() {
  const classes = useStyles();
  const [queries, setQueries] = useState<IQuery[]>([]);
  const [filter, setFilter] = useState<IFilter>({filter: "", filterIdsList: "", stopWords: stopWordsCzech.sort(), filterRandomSize: 1000});
  const [error, setError] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = React.useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);


  const [selectedDateFrom, setSelectedDateFrom] = useState<Date | null>(new Date());
  const [selectedDateTo, setSelectedDateTo] = useState<Date | null>(new Date());
  const [urlSelect, setUrlSelect] = useState<string | null>("contain");
  const [url, setUrl] = useState<string | null>("");
  const [sentiment, setSentiment] = useState<number | number[]>([-1,1]);
  const [theme, setTheme] = useState<string | null>("");
  const [inputTheme, setInputTheme] = useState<string | undefined>("");
  const [pageType, setPageType] = useState<string | undefined>("");

  const [topics, setTopics] = useState<string[]>([]);
  const [webTypes, setWebTypes] = useState<string[]>([]);

  const handleSearch = () => {
    fetch("/api/search", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base: {
          filter: (filter.filter.length === 0 ? "*:*" : filter.filter),
          entries: filter.filterRandomSize,
          stopWords: filter.stopWords.map(v => v.trim())
        }, queries: queries.map(function(x) {
          return {
            type: x.searchType,
            texts: x.queries,
            contextSize: (x.context ? x.contextSize : 0)
          };
        })}),
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = "results.zip";
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();
        a.remove();  //afterwards we remove the element again
      })
      .catch(_error => setError(true));
  };

  const handleCloseError = () => {
    setError(false);
  };

  const handleCloseSent = () => {
    setSent(false);
  };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const appendFilter = (text: string) => {
    let f:IFilter = _.cloneDeep(filter);
    f.filter = f.filter + text;
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
          setTopics(["ČR"]);
        }
      )
    fetch("/api/webtype")
      .then(res => res.json())
      .then(
        (result) => {
          setWebTypes(result);
        },
        (_error) => {
          setWebTypes(["forum"]);
        }
      )
  }, [])

  return (
    <>
      <div className={classes.root}>
        <AppBar
          position="fixed"
          color="default"
          className={clsx(classes.appBar)}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={drawerOpen ? handleDrawerClose : handleDrawerOpen}
              edge="start"
              className={classes.menuButton}
            >
              {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
            <img src={logoNk} alt="Logo National Library" className={classes.logoNK}/>
            <img src={logoWebArchive} alt="Logo Webarchiv"  className={classes.logoWA}/>
            {/*<Typography variant="h6" noWrap  className={classes.logoWebarchiv}>*/}
            {/*  Webarchiv*/}
            {/*  <span style={{borderBottom: '1px solid #0000ff',*/}
            {/*    position: 'absolute',*/}
            {/*    left: 0,*/}
            {/*    top: 0,*/}
            {/*    width: '100%',*/}
            {/*    height: '1.7rem'}}/>*/}
            {/*</Typography>*/}
            <div className={classes.grow} />
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={menuAnchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={menuOpen}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                <MenuItem onClick={handleMenuClose}>My account</MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: drawerOpen,
            [classes.drawerClose]: !drawerOpen,
          })}
          classes={{
            paper: clsx({
              [classes.drawerOpen]: drawerOpen,
              [classes.drawerClose]: !drawerOpen,
            }),
          }}
        >
          <Toolbar/>
          <div className={classes.drawerBody}>
            <List subheader={<ListSubheader color="primary" style={{textAlign: 'center'}}>Filtre</ListSubheader>}>
              <Divider />
              <ListItem classes={{secondaryAction: classes.secondaryActionWider}}>
                <ListItemIcon>
                  <ClassIcon/>
                </ListItemIcon>
                <ListItemText primary={
                  <FormControl className={classes.fullWidth}>
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
                }/>
                <ListItemSecondaryAction>
                  <Fab size="small" className={classes.drawerListFab} onClick={() => appendFilter("topics:\""+theme+"\"")}>=</Fab>&nbsp;&nbsp;
                  <Fab size="small" className={classes.drawerListFab} onClick={() => appendFilter("NOT topics:\""+theme+"\"")}>≠</Fab>
                </ListItemSecondaryAction>
              </ListItem>
            {/*</List>*/}
            <Divider />
            {/*<List>*/}
              <ListItem classes={{secondaryAction: classes.secondaryActionWider}}>
              <ListItemIcon>
                <DvrIcon/>
              </ListItemIcon>
              <ListItemText primary={
                <>
                  <FormControl className={classes.fullWidth}>
                    <Select
                      id="page-type"
                      label="Typ stránky"
                      value={pageType}
                      onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                        setPageType(event.target.value as string);
                      }}
                    >
                      {webTypes.map((value) => {
                        return  <MenuItem key={value} value={value}>{value}</MenuItem>
                      })}
                    </Select>
                  </FormControl>
                </>
              }/>
              <ListItemSecondaryAction className={classes.secondaryActionBox}>
                <Fab size="small" className={classes.drawerListFab} onClick={() => appendFilter("webType:\""+pageType+"\"")}>=</Fab>&nbsp;&nbsp;
                <Fab size="small" className={classes.drawerListFab} onClick={() => appendFilter("NOT webType:\""+pageType+"\"")}>≠</Fab>
              </ListItemSecondaryAction>
            </ListItem>
            {/*</List>*/}
            <Divider />
            {/*<List>*/}
              <ListItem classes={{secondaryAction: classes.secondaryAction}}>
                <ListItemIcon>
                  <DateRangeIcon/>
                </ListItemIcon>
                <ListItemText primary={
                  <>
                    <KeyboardDatePicker
                      disableToolbar
                      variant="inline"
                      format="dd.MM.yyyy"
                      margin="normal"
                      autoOk={true}
                      label="Datum sklizne od"
                      value={selectedDateFrom}
                      style={{margin: 0}}
                      onChange={(date: Date | null) => {
                        setSelectedDateFrom(date);
                      }}
                    />
                    <br/>
                    <KeyboardDatePicker
                      disableToolbar
                      variant="inline"
                      format="dd.MM.yyyy"
                      margin="normal"
                      autoOk={true}
                      label="Datum sklizne do"
                      value={selectedDateTo}
                      style={{margin: 0}}
                      onChange={(date: Date | null) => {
                        setSelectedDateTo(date);
                      }}
                    />
                  </>
                }/>
                <ListItemSecondaryAction>
                  <Fab size="small" className={classes.drawerListFab} onClick={() => appendFilter("date:["+format(selectedDateFrom ? selectedDateFrom : 0, "yyyy-MM-dd")+"T00:00:00Z TO "+format(selectedDateTo ? selectedDateTo : 0, "yyyy-MM-dd")+"T00:00:00Z]")}>
                    <AddIcon fontSize="small"/>
                  </Fab>
                </ListItemSecondaryAction>
              </ListItem>
            {/*</List>*/}
            <Divider />
            {/*<List>*/}
              <ListItem classes={{secondaryAction: classes.secondaryAction}}>
                <ListItemIcon>
                  <HttpIcon/>
                </ListItemIcon>
                <ListItemText primary={
                  <>
                    <FormControl className={classes.fullWidth}>
                      <InputLabel id="url-operator-label">Operator</InputLabel>
                      <Select
                        labelId="url-operator-label"
                        id="url-operator"
                        value={urlSelect}
                        onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                          setUrlSelect(event.target.value as string);
                        }}
                      >
                        <MenuItem value="contain">obsahuje</MenuItem>
                        <MenuItem value="contain-not">neobsahuje</MenuItem>
                        <MenuItem value="equal">rovna se</MenuItem>
                        <MenuItem value="equal-not">nerovna se</MenuItem>
                      </Select>
                    </FormControl>
                    <br/>
                    <TextField
                      label="URL"
                      value={url}
                      className={classes.fullWidth}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setUrl(event.target.value);
                      }}
                    />
                  </>
                }/>
                <ListItemSecondaryAction>
                  <Fab size="small" className={classes.drawerListFab} onClick={handleAppendUrl}>
                    <AddIcon fontSize="small"/>
                  </Fab>
                </ListItemSecondaryAction>
              </ListItem>
            {/*</List>*/}
            <Divider />
            {/*<List>*/}
              <ListItem classes={{secondaryAction: classes.secondaryActionWider}}>
                <ListItemIcon>
                  <SentimentVerySatisfiedIcon/>
                </ListItemIcon>
                <ListItemText primary={
                  <Typography variant="body2" gutterBottom>
                    Sentiment
                  </Typography>
                } secondary={
                  <FormControl className={classes.fullWidth}>
                    <Slider
                      step={0.1}
                      marks
                      min={-1.0}
                      max={1.0}
                      valueLabelDisplay="auto"
                      value={sentiment}
                      onChange={(_event: any, newValue: number | number[]) => {
                        setSentiment(newValue);
                      }}
                    />
                  </FormControl>
                }/>
                <ListItemSecondaryAction className={classes.secondaryActionBox}>
                  <Fab size="small" className={classes.drawerListFab} onClick={() => appendFilter("sentiment:"+((sentiment as number[]) ? "["+(sentiment as number[])[0]+" TO "+(sentiment as number[])[1]+"]" : sentiment))}>=</Fab>&nbsp;&nbsp;
                  <Fab size="small" className={classes.drawerListFab} onClick={() => appendFilter("NOT sentiment:"+((sentiment as number[]) ? "["+(sentiment as number[])[0]+" TO "+(sentiment as number[])[1]+"]" : sentiment))}>≠</Fab>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            <Divider />
            <List subheader={<ListSubheader color="primary" style={{textAlign: 'center'}}>Nastavení</ListSubheader>}>
              <Divider />
              <ListItem classes={{secondaryAction: classes.secondaryAction}}>
                <ListItemIcon>
                  <SpellcheckIcon/>
                </ListItemIcon>
                <ListItemText primary="Stop slova" secondary={
                  <Typography variant="body2" style={{whiteSpace: 'break-spaces'}}>{filter.stopWords.slice(0, 8).join(", ") + (filter.stopWords.length > 8 ? ",..." : "")}</Typography>
                }/>
                <ListItemSecondaryAction>
                  <Fab size="small">
                    <EditIcon fontSize="small"/>
                  </Fab>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FormatListNumberedIcon/>
                </ListItemIcon>
                <ListItemText primary="Počet záznamů" secondary={
                  <TextField inputProps={{min: 10, max: 1000}} type="number" className={classes.fullWidth} value={filter.filterRandomSize} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    let f:IFilter = _.cloneDeep(filter);
                    f.filterRandomSize = parseInt(event.target.value);
                    if (f.filterRandomSize > 1000) f.filterRandomSize = 1000;
                    if (f.filterRandomSize < 10) f.filterRandomSize = 10;
                    setFilter(f);
                  }}/>
                }/>
              </ListItem>
            </List>
          </div>
        </Drawer>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Grid container spacing={2}>
            <Grid item md={10} xs={12}>
              <Filters filter={filter} setFilter={setFilter}/>
              <AnalyticQueriesForm queries={queries} setQueries={setQueries}/>
            </Grid>
            <Grid item md={2} xs={12} justify="center" style={{textAlign: "center", marginTop: "4rem"}}>
              <Fab variant="extended" color="primary" onClick={handleSearch}>Vyhledat</Fab>
            </Grid>
          </Grid>
        </main>
      </div>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={error}
        onClose={handleCloseError}
      >
        <Alert onClose={handleCloseError} severity="error">
          An Error occurs
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={sent}
        onClose={handleCloseSent}
      >
        <Alert onClose={handleCloseSent} severity="success">
          Search query created.
        </Alert>
      </Snackbar>
    </>
  );
}

export default SearchForm;
