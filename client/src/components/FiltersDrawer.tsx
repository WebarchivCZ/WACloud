import clsx from "clsx";
import {
  createStyles,
  Divider, Drawer, IconButton,
  List,
  ListSubheader, makeStyles, Theme,
  Toolbar,
} from "@material-ui/core";
import React, {Dispatch, FunctionComponent, ReactElement, SetStateAction, useEffect, useState} from "react";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import {ThemeFilter} from "./filters/ThemeFilter";
import {PageTypeFilter} from "./filters/PageTypeFilter";
import {useTranslation} from "react-i18next";
import {DateFilter} from "./filters/DateFilter";
import {UrlFilter} from "./filters/UrlFilter";
import {SentimentFilter} from "./filters/SentimentFilter";
import stopWordsCzech from "../config/stopWords";
import {IFilter} from "../old/SearchForm";
import {StopWordsFilter} from "./filters/StopWordsFilter";
import {EntriesLimitFilter} from "./filters/EntriesLimitFilter";
import _ from "lodash";

const drawerWidth = 320;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    drawerBody: {
      width: drawerWidth,
    },
    drawerOpen: {
      width: drawerWidth,
      overflowX: 'hidden',
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
      overflowY: 'hidden',
      width: theme.spacing(6.5) + 1,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(6.5) + 1,
      },
    },
    listHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      textTransform: 'uppercase',
      backgroundColor: 'rgba(0,0,255,0.05)',
      fontWeight: 700,
      fontSize: '16px',
      minHeight: theme.spacing(6)
    },
  }),
);

type ListHeaderProps = {
  icon?: ReactElement<any, any>|undefined,
  onIconClick?: any,
  shown: boolean
}

const ListHeader: FunctionComponent<ListHeaderProps> = ({icon, onIconClick, shown, children}) => {
  const classes = useStyles();
  return (
    <ListSubheader color="primary" className={classes.listHeader}>
      {shown && children}{' '}
      {icon && (
        <IconButton
          onClick={onIconClick}
          edge="start"
        >
          {icon}
        </IconButton>
      )}
    </ListSubheader>
  );
};

interface FiltersDrawerProps {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  stopWords: string[];
  setStopWords: Dispatch<SetStateAction<string[]>>;
  entriesLimit: number;
  setEntriesLimit: Dispatch<SetStateAction<number>>;
  drawerOpen: boolean;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
}

export const FiltersDrawer = ({query, setQuery,
                              stopWords, setStopWords,
                              entriesLimit, setEntriesLimit,
                              drawerOpen, setDrawerOpen}: FiltersDrawerProps) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [theme, setTheme] = useState<string | null>("");
  const [pageType, setPageType] = useState<string | undefined>("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [urlSelect, setUrlSelect] = useState<string | null>("contain");
  const [url, setUrl] = useState<string | null>("");
  const [sentiment, setSentiment] = useState<number | number[]>([-1,1]);

  const [topics, setTopics] = useState<string[]>([]);
  const [webTypes, setWebTypes] = useState<string[]>([]);

  const appendQuery = (appendValue: string) => setQuery(query+appendValue)

  useEffect(() => {
    fetch("/api/topic")
      .then(res => res.json())
      .then(
        (result) => setTopics(result),
        (_error) => setTopics(["ČR"])
      )
    fetch("/api/webtype")
      .then(res => res.json())
      .then(
        (result) => setWebTypes(result),
        (_error) => setWebTypes(["forum"])
      )
  }, [])

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  }

  const lists = [
    {
      header: <ListHeader shown={drawerOpen} icon={drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                          onIconClick={toggleDrawer}>
          {t('filters.filtersSectionHeader')}
        </ListHeader>,
      filters: [
        <ThemeFilter value={theme} setValue={setTheme} options={topics} append={appendQuery}/>,
        <PageTypeFilter value={pageType} setValue={setPageType} options={webTypes} append={appendQuery}/>,
        <DateFilter from={dateFrom} setFrom={setDateFrom} to={dateTo} setTo={setDateTo} append={appendQuery}/>,
        <UrlFilter operator={urlSelect} setOperator={setUrlSelect} url={url} setUrl={setUrl} append={appendQuery}/>,
        <SentimentFilter value={sentiment} setValue={setSentiment} append={appendQuery}/>
      ]
    },
    {
      header: <ListHeader shown={drawerOpen}>{t('filters.settingsSectionHeader')}</ListHeader>,
      filters: [
        <StopWordsFilter value={stopWords} setValue={setStopWords}/>,
        <EntriesLimitFilter value={entriesLimit} setValue={setEntriesLimit}/>
      ]
    }
  ];

  return (
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
        {lists.map(({header, filters}, index) => (
          <div key={index}>
            <Divider />
            <List subheader={header}>
              {filters.map((filter, subIndex) => (
                <div key={subIndex}>
                  <Divider />
                  {filter}
                </div>
              ))}
            </List>
          </div>
        ))}
      </div>
    </Drawer>
  )
};
