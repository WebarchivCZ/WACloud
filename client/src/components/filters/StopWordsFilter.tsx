import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Typography,
  Box,
  Chip,
  makeStyles,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@material-ui/core';
import SpellcheckIcon from '@material-ui/icons/Spellcheck';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';

import { ValuableProps } from '../../interfaces/ValuableProps';

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
  }
}));

export const StopWordsFilter = ({ value, setValue, disabled }: ValuableProps<string[]>) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [stopWords, setStopWords] = useState(value);
  const [currentStopWord, setCurrentStopWord] = useState('');

  const handleClickOpen = () => {
    setOpen(true);
    setStopWords(value);
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
          {value.slice(0, 8).join(', ') + (value.length > 8 ? ',...' : '')}
        </Typography>
      </FilterContent>
      <Dialog open={open} onClose={handleClose} maxWidth="lg">
        <DialogTitle>
          <Typography variant="h2">{t<string>('filters.stopWords.title')}</Typography>
        </DialogTitle>
        <DialogContent>
          <Box display="flex">
            <TextField
              label={t<string>('filters.stopWords.addNext')}
              value={currentStopWord}
              onChange={(event) => setCurrentStopWord(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddStopWord(currentStopWord);
              }}
              style={{ marginBottom: 16 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleAddStopWord(currentStopWord);
              }}
              style={{
                width: '40px',
                height: '40px',
                margin: '0px',
                padding: '0px',
                minWidth: '40px'
              }}>
              <AddIcon fontSize="small" />
            </Button>
          </Box>
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
              setValue(stopWords);
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
