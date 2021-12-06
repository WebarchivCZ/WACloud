import {createTheme, ThemeOptions} from "@material-ui/core/styles";
import grey from "@material-ui/core/colors/grey";

export const themeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Times New Roman", Times, serif',
    h1: {
      fontWeight: 700,
      fontSize: '44px',
      lineHeight: '55px',
      padding: '8px 0',
    },
    h2: {
      fontWeight: 700,
      fontSize: '24px',
      lineHeight: '28px',
      padding: '8px 0',
      textTransform: 'uppercase'
    },
    body2: {
      fontSize: '18px',
      lineHeight: '21px'
    },
    subtitle2: {
      fontWeight: 700,
      fontSize: '16px',
      lineHeight: '18px'
    }
  },
  palette: {
    background: {
      default: '#ffffff'
    },
    primary: {
      main: '#0000ff',
    },
    secondary: {
      main: '#E64949'
    }
  },
  overrides: {
    MuiAppBar: {
      colorDefault: {
        backgroundColor: grey["100"]
      },
      root: {
        boxShadow: '0px 1px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.04),0px 1px 1px 0px rgba(0,0,0,0.04)'
      }
    },
    MuiButton: {
      contained: {
        borderRadius: 0,
        textTransform: 'none',
        boxShadow: '0px 3px 3.5px rgba(0, 0, 0, 0.14), 0px 1px 7px rgba(0, 0, 0, 0.12), 0px 1.5px 4px rgba(0, 0, 0, 0.2)',
      },
      sizeLarge: {
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '21px',
        padding: '13px 51px'
      },
      // TODO FIX, NOT WORKING
      // disabled: {
      //   backgroundColor: '#EFEFEF'
      // }
    },
    MuiPaper: {
      rounded: {
        borderRadius: 0
      },
      elevation1: {
        border: '2px solid #DFDFDF'
      },
      elevation8: {
        boxShadow: '0px 1px 1px -3px rgba(0,0,0,0.05),0px 1px 1px 1px rgba(0,0,0,0.05),0px 1px 1px 2px rgba(0,0,0,0.05)',
      }
    },
    MuiListItem: {
      root: {
        alignItems: 'stretch',
        paddingTop: '16px',
        paddingBottom: '16px'
      },
      secondaryAction: {
        paddingRight: '72px'
      }
    },
    MuiListItemIcon: {
      root:{
        minWidth: '36px',
        color: '#000000',
        margin: '4px 0',
        '& > svg': {
          width: '20px',
          height: '20px'
        }
      }
    },
    MuiListItemSecondaryAction: {
      root: {
        right: '12px',
        '& button': {
          minWidth: '40px',
          width: '40px',
          height: '40px',
          borderRadius: 0,
          padding: 0
        },
      }
    },
    MuiFilledInput: {
      root: {
        padding: '16px 20px'
      },
      multiline: {
        borderRadius: '0px'
      }
    }
  }
};
export const theme = createTheme(themeOptions);
