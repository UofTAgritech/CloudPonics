// React engine, router
import { FC } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

// Contexts
import {useAuth} from './contexts/AuthContext';

// Components
import NavBar from './components/NavBar';
import CircularProgress from '@material-ui/core/CircularProgress';

// Pages
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Device from './pages/Device';

// Theme
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

const theme = createTheme({
  typography: {
    fontFamily: 'AvantGarde'
  },
  palette: {
    background: {
      default: '#FBFBF2',
      paper: '#F1F1E4'
    },
    text: {
      primary: '#434051',
      secondary: '#434051'
    },
    primary: {
      main: '#197D2A',
      light: '#3DB351',
      contrastText: '#FBFBF2'
    },
    secondary: {
      main: '#C85E41',
      light: '#E47862',
      contrastText: '#FBFBF2'
    }
  },
  overrides: {
    MuiPaper: {
      rounded: {
        borderRadius: 25
      }
    }
  }
});

const AuthLoader:FC = ({children}) => {
  return (
    <>
    {useAuth() === undefined ? 
      (
        <div style={{
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '2%'
        }}>
        <CircularProgress/>
        </div>
        ) : (
          <>
          {children}
          </>
          )
        }
        </>
        );
      };
      
      const App:FC = () => {
        return (
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
              <NavBar />
              <AuthLoader>
                <Switch>
                  <Route path='/login'>
                    {useAuth() ? <Redirect to='/dashboard'/> : <Auth/> }
                  </Route>
                  {/* Pages with auth precondition */}
                  {useAuth() ? (
                    <>
                      <Route exact path='/dashboard' component={Dashboard}/>
                      <Route exact path='/devices/:deviceid' render={(params)=>{
                        return (<Device {...params.match.params}/>);
                      }}/>
                      {/* Default */}
                      <Redirect to='/dashboard'/>
                    </>
                  ) : <Redirect to='/login'/>}
                </Switch>
              </AuthLoader>
            </Router>
          </ThemeProvider>
          );
        };
        
        export default App;