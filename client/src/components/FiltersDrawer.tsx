import clsx from 'clsx';
import {
  createStyles,
  Divider,
  Drawer,
  IconButton,
  List,
  ListSubheader,
  makeStyles,
  Theme,
  Toolbar
} from '@material-ui/core';
import React, {
  Dispatch,
  FunctionComponent,
  ReactNode,
  SetStateAction,
  useEffect,
  useState
} from 'react';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useTranslation } from 'react-i18next';

import { ThemeFilter } from './filters/ThemeFilter';
import { PageTypeFilter } from './filters/PageTypeFilter';
import { DateFilter } from './filters/DateFilter';
import { UrlFilter } from './filters/UrlFilter';
import { SentimentFilter } from './filters/SentimentFilter';
import { StopWordsFilter } from './filters/StopWordsFilter';
import { EntriesLimitFilter } from './filters/EntriesLimitFilter';

const drawerWidth = 320;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap'
    },
    drawerBody: {
      width: drawerWidth
    },
    drawerOpen: {
      width: drawerWidth,
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      overflowX: 'hidden',
      overflowY: 'hidden',
      width: theme.spacing(6.5) + 1,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(6.5) + 1
      }
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
    listHeaderDisabled: {
      backgroundColor: 'rgba(0,0,0,0.05)'
    }
  })
);

type ListHeaderProps = {
  icon?: ReactNode;
  onIconClick?: React.MouseEventHandler<HTMLButtonElement>;
  shown: boolean;
  disabled?: boolean;
  children?: ReactNode;
};

const ListHeader: FunctionComponent<ListHeaderProps> = ({
  icon,
  onIconClick,
  shown,
  disabled,
  children
}) => {
  const classes = useStyles();
  return (
    <ListSubheader
      color="primary"
      className={clsx(classes.listHeader, { [classes.listHeaderDisabled]: disabled })}>
      {shown && children}{' '}
      {icon && (
        <IconButton onClick={onIconClick} edge="start">
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
  seed: number | null;
  setSeed: Dispatch<SetStateAction<number | null>>;
  drawerOpen: boolean;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  disabled?: boolean;
}

export const FiltersDrawer = ({
  query,
  setQuery,
  stopWords,
  setStopWords,
  entriesLimit,
  setEntriesLimit,
  seed,
  setSeed,
  drawerOpen,
  setDrawerOpen,
  disabled
}: FiltersDrawerProps) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [theme, setTheme] = useState<string | null>('');
  const [pageType, setPageType] = useState<string | undefined>('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [urlSelect, setUrlSelect] = useState<string | null>('contain');
  const [url, setUrl] = useState<string | null>('');
  const [sentiment, setSentiment] = useState<number | number[]>([-1, 1]);

  const [topics, setTopics] = useState<string[]>([]);
  const [webTypes, setWebTypes] = useState<string[]>([]);

  const appendQuery = (appendValue: string) => setQuery(query + appendValue);

  useEffect(() => {
    fetch('/api/topic')
      .then((res) => res.json())
      .then(
        (result) => setTopics(result),
        () => setTopics(['ČR'])
      );
    fetch('/api/webtype')
      .then((res) => res.json())
      .then(
        (result) => setWebTypes(result),
        () => setWebTypes(['forum'])
      );
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const lists = [
    {
      header: (
        <ListHeader
          shown={drawerOpen}
          icon={drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          onIconClick={toggleDrawer}
          disabled={disabled}>
          {t<string>('filters.filtersSectionHeader')}
        </ListHeader>
      ),
      filters: [
        <ThemeFilter
          key="theme"
          value={theme}
          setValue={setTheme}
          options={topics}
          append={appendQuery}
          disabled={disabled}
        />,
        <PageTypeFilter
          key="pageType"
          value={pageType}
          setValue={setPageType}
          options={webTypes}
          append={appendQuery}
          disabled={disabled}
        />,
        <DateFilter
          key="dateFilter"
          from={dateFrom}
          setFrom={setDateFrom}
          to={dateTo}
          setTo={setDateTo}
          append={appendQuery}
          disabled={disabled}
        />,
        <UrlFilter
          key="urlFilter"
          operator={urlSelect}
          setOperator={setUrlSelect}
          url={url}
          setUrl={setUrl}
          append={appendQuery}
          disabled={disabled}
        />,
        <SentimentFilter
          key="sentimentFilter"
          value={sentiment}
          setValue={setSentiment}
          append={appendQuery}
          disabled={disabled}
        />
      ]
    },
    {
      header: (
        <ListHeader shown={drawerOpen} disabled={disabled}>
          {t<string>('filters.settingsSectionHeader')}
        </ListHeader>
      ),
      filters: [
        <StopWordsFilter
          key="stopWordsFilter"
          value={stopWords}
          setValue={setStopWords}
          disabled={disabled}
        />,
        <EntriesLimitFilter
          key="entriesLimitFilter"
          value={entriesLimit}
          setValue={setEntriesLimit}
          seed={seed}
          setSeed={setSeed}
          disabled={disabled}
        />
      ]
    }
  ];

  return (
    <Drawer
      variant="permanent"
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: drawerOpen,
        [classes.drawerClose]: !drawerOpen
      })}
      classes={{
        paper: clsx({
          [classes.drawerOpen]: drawerOpen,
          [classes.drawerClose]: !drawerOpen
        })
      }}>
      <Toolbar />
      <div className={classes.drawerBody}>
        {lists.map(({ header, filters }, index) => (
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
  );
};
