import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  makeStyles,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip
} from '@material-ui/core';
import SpellcheckIcon from '@material-ui/icons/Spellcheck';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import GetAppIcon from '@material-ui/icons/GetApp';
import PublishIcon from '@material-ui/icons/Publish';
import DeleteIcon from '@material-ui/icons/Delete';

import { SearchContext } from '../Search.context';
import { Types } from '../reducers';

import { FilterContent } from './FilterContent';

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
    margin: 0
  },
  button: {
    width: 'auto',
    height: '40px',
    margin: '0px',
    padding: '0.5rem',
    minWidth: '40px'
  }
}));

type Props = {
  disabled?: boolean;
};

export const StopWordsFilter = ({ disabled }: Props) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { state, dispatch } = useContext(SearchContext);

  const [open, setOpen] = useState(false);
  const [stopWords, setStopWords] = useState(state.stopWords); // Current stopwords
  const [currentStopWord, setCurrentStopWord] = useState('');

  const handleClickOpen = () => {
    setOpen(true);
    setStopWords(state.stopWords);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRemoveStopWord = (index: number) => {
    const newStopWords = [...stopWords];
    newStopWords.splice(index, 1);
    setStopWords(newStopWords);
  };

  const handleAddStopWord = (newStopWord: string) => {
    const newStopWords = [...stopWords];
    newStopWords.push(newStopWord);
    setStopWords(newStopWords);
  };

  const loadStopWords = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    e.preventDefault();
    const newStopWords = await e.target.files?.[0].text();
    setStopWords(newStopWords.split('\n'));
  };

  const exportStopWords = () => {
    const blob = new Blob([stopWords.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stopwords.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <FilterContent
        title={t<string>('filters.stopWords.title')}
        icon={<SpellcheckIcon />}
        buttons={[
          <Button
            key="edit"
            variant="outlined"
            color="default"
            disabled={disabled}
            size="small"
            onClick={handleClickOpen}>
            <EditIcon fontSize="small" />
          </Button>
        ]}>
        <Typography variant="body2" style={{ whiteSpace: 'break-spaces' }}>
          {state.stopWords.slice(0, 8).join(', ') + (state.stopWords.length > 8 ? ',...' : '')}
        </Typography>
      </FilterContent>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>
          <Typography variant="h2">{t<string>('filters.stopWords.title')}</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid item xs={3}>
              <Box display="flex" gridGap={8}>
                <TextField
                  label={t<string>('filters.stopWords.addNext')}
                  value={currentStopWord}
                  onChange={(event) => setCurrentStopWord(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setCurrentStopWord('');
                      handleAddStopWord(currentStopWord);
                    }
                  }}
                  style={{ marginBottom: 16 }}
                />
                <Tooltip title={t<string>('filters.stopWords.add')} aria-label="add">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setCurrentStopWord('');
                      handleAddStopWord(currentStopWord);
                    }}
                    className={classes.button}>
                    <AddIcon fontSize="small" />
                  </Button>
                </Tooltip>
                <Tooltip title={t<string>('filters.stopWords.deleteAll')} aria-label="delete">
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      setCurrentStopWord('');
                      setStopWords([]);
                    }}
                    className={classes.button}>
                    <DeleteIcon fontSize="small" />
                  </Button>
                </Tooltip>
              </Box>
            </Grid>
            <Grid item xs={9}>
              <Grid
                container
                spacing={2}
                direction="row"
                justifyContent="flex-end"
                alignItems="center">
                <Grid item>
                  <Button
                    startIcon={<GetAppIcon />}
                    variant="contained"
                    component="label"
                    className={classes.button}>
                    {t<string>('filters.stopWords.import')}
                    <input
                      type="file"
                      hidden
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => loadStopWords(e)}
                    />
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    startIcon={<PublishIcon />}
                    variant="contained"
                    component="label"
                    className={classes.button}
                    onClick={exportStopWords}>
                    {t<string>('filters.stopWords.export')}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Typography variant="body1">{t<string>('filters.stopWords.list')}</Typography>
          <Box component="ul" className={classes.chipRoot}>
            {stopWords.map((q, ind) => (
              <li key={ind}>
                <Chip
                  label={q}
                  onDelete={() => handleRemoveStopWord(ind)}
                  className={classes.chip}
                />
              </li>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            {t<string>('filters.stopWords.cancel')}
          </Button>
          <Button
            onClick={() => {
              handleClose();
              // Upade stopwords in context
              dispatch({ type: Types.SetStopWords, payload: { stopWords } });
            }}
            variant="contained"
            color="primary">
            {t<string>('filters.stopWords.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
