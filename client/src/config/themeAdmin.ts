import {createTheme, ThemeOptions} from "@material-ui/core/styles";
import {themeOptions} from "./theme";

let options: ThemeOptions = themeOptions;
if (options.typography) {
  if ("fontFamily" in options.typography) {
    options.typography.fontFamily = '"Roboto", "Helvetica", "Arial", sans-serif';
  }
}
export const themeAdmin = createTheme(options);
