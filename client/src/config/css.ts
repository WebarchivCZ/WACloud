import withStyles from "@material-ui/core/styles/withStyles";

export const GlobalCss = withStyles({
  '@global': {
    '.MuiOutlinedInput-root': {
      borderRadius: 0,
      backgroundColor: '#F5F5F5'
    },
    '.MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 0, 255)'
    }
  },
})(() => null);
