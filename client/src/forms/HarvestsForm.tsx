import { useTranslation } from 'react-i18next';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  makeStyles,
  Checkbox,
  CardHeader,
  Box
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import clsx from 'clsx';

import IHarvest from '../interfaces/IHarvest';

const useStyles = makeStyles(() => ({
  shortCut: {
    fontSize: '30px',
    fontWeight: 400,
    lineHeight: '35px'
  },
  selected: {
    border: '1px solid #0000ff'
  },
  content: {
    marginTop: 0,
    paddingTop: 0,
    '& > table th': {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '18px',
      color: '#757575',
      textAlign: 'left',
      whiteSpace: 'nowrap',
      padding: '8px 24px 8px 0'
    },
    '& > table td': {
      fontSize: '16px',
      lineHeight: '18px'
    }
  },
  small: {
    backgroundColor: '#f5f5f5',
    padding: '0 0 0 10px',
    display: 'inline-block'
  }
}));

interface HarvestsProps {
  harvests: string[];
  setHarvests: (harvests: string[]) => any;
  minimal: boolean;
}

// TODO FAKE REMOVE START
interface FakeDataProps {
  name: string;
  size: string;
  warcs: number;
  date: string;
}

const fakeData: FakeDataProps[] = [
  { name: 'Totals-2020-12-NIC_CZ', size: '4.7 TB', warcs: 4676, date: '2020-12-08' },
  { name: 'Continuous-2020-12-28-NewsDigest', size: '991 MB', warcs: 8, date: '2020-12-28' },
  { name: 'Topics-2020-10-01-VolbyKrajeSenat2020', size: '322 GB', warcs: 305, date: '2021-06-08' },
  {
    name: 'Topics_2021-07_T-CUNI_MGHMP_Klima_Tornado2_Olympiada3',
    size: '260 GB',
    warcs: 236,
    date: '2021-07-30'
  },
  { name: 'Serials_2021-08_1M-2M_OneShot', size: '296 GB', warcs: 280, date: '2021-08-30' },
  { name: 'Serials_2021-09_1M-6M_OneShot', size: '676 GB', warcs: 628, date: '2021-09-29' },
  { name: 'Tests-2021-03-T-UDHPSH_QAtestII', size: '30 GB', warcs: 31, date: '2021-03-29' },
  { name: 'Requests-2019-12-25_special', size: '2.7 GB', warcs: 3, date: '2019-12-25' }
];
// TODO FAKE REMOVE END

export const HarvestsForm = ({ harvests, setHarvests, minimal }: HarvestsProps) => {
  const { t, i18n } = useTranslation();
  const classes = useStyles();

  const [allHarvests, setAllHarvests] = useState<IHarvest[]>([]);

  const nameToShortcut = (name: string) => {
    if (name.toLowerCase().indexOf('test') !== -1) {
      return 'Te';
    }
    if (name.toLowerCase().startsWith('request')) {
      return 'Rq';
    }
    return name.substring(0, 2);
  };

  const isHarvestChecked = (name: string) => harvests.includes(name);

  const handleToggleHarvest = (name: string) => () => {
    const harvestsCopy = _.clone(harvests);
    if (isHarvestChecked(name)) {
      harvestsCopy.splice(harvestsCopy.indexOf(name), 1);
    } else {
      harvestsCopy.push(name);
    }
    setHarvests(harvestsCopy);
  };

  useEffect(() => {
    fetch('/api/harvest')
      .then((res) => res.json())
      .then(
        (result) => {
          const harvests = result.filter((h: IHarvest) => h.state === 'INDEXED');
          // TODO FAKE REMOVE start
          while (harvests.length < fakeData.length) {
            const fake = fakeData[harvests.length];
            harvests.push({
              identification: fake.name,
              entries: fake.warcs,
              date: fake.date
            });
          }
          // TODO FAKE REMOVE END
          setAllHarvests(harvests);
        },
        () => {
          setAllHarvests([]);
        }
      );
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h2" style={{ display: 'inline-block', marginRight: '16px' }}>
          {t<string>('harvests.title')}
        </Typography>
        {minimal &&
          allHarvests
            .filter((h) => isHarvestChecked(h.identification))
            .map((harvest, index) => (
              <Box ml={1} className={classes.small} key={index}>
                {nameToShortcut(harvest.identification)}
                <Checkbox color="primary" size="small" disabled checked />
              </Box>
            ))}
      </Grid>
      {!minimal &&
        allHarvests.map((harvest, index) => (
          <Grid item xs={12} sm={12} md={6} lg={4} xl={3} key={index}>
            <Card
              variant="outlined"
              className={clsx({
                [classes.selected]: isHarvestChecked(harvest.identification)
              })}
              onClick={handleToggleHarvest(harvest.identification)}>
              <CardHeader
                avatar={
                  <Typography variant="h3" className={classes.shortCut}>
                    {nameToShortcut(harvest.identification)}
                  </Typography>
                }
                action={
                  <Checkbox
                    color="primary"
                    checked={isHarvestChecked(harvest.identification)}
                    onChange={handleToggleHarvest(harvest.identification)}
                  />
                }
              />
              <CardContent className={classes.content}>
                <table>
                  <tbody>
                    <tr>
                      <th>{t<string>('harvests.name')}</th>
                      <td>{harvest.identification}</td>
                    </tr>
                    <tr>
                      <th>{t<string>('harvests.size')}</th>
                      <td>{fakeData[index].size}</td>
                    </tr>
                    <tr>
                      <th>{t<string>('harvests.WARCs')}</th>
                      <td>{harvest.entries.toLocaleString(i18n.language)}</td>
                    </tr>
                    <tr>
                      <th>{t<string>('harvests.date')}</th>
                      <td>{new Date(harvest.date).toLocaleDateString(i18n.language)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </Grid>
        ))}
    </Grid>
  );
};
