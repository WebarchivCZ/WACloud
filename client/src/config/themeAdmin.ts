import { createTheme, ThemeOptions } from '@material-ui/core/styles';

import { themeOptions } from './theme';

const options: ThemeOptions = themeOptions;
if (options.typography) {
  if ('fontFamily' in options.typography) {
    // options.typography.fontFamily = '"Roboto", "Helvetica", "Arial", sans-serif';
  }
  if ('h1' in options.typography) {
    options.typography.h1 = {
      fontWeight: 700,
      fontSize: '30px',
      lineHeight: '35px',
      margin: '12px 0 36px'
    };
  }
}
export const themeAdmin = createTheme(options);
