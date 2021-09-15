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

// Theme
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

const theme = createTheme({
    typography: {
        fontFamily: 'AvantGarde'
    },
    palette: {
        background: {
            default: '#F4F4F7',
            paper: '#DCDCF9'
        },
        text: {
            primary: '#434051',
            secondary: '#383645'
        },
        primary: {
            main: '#4343ED',
            light: '#DCDCF9',
            contrastText: '#F4F4F7'
        },
        secondary: {
            main: '#F5296D',
            contrastText: '#F4F4F7'
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
                        <Route exact path='/dashboard'>
                            {useAuth() ? <Dashboard/> : <Redirect to='/login'/>}
                        </Route>
                        <Route exact path='/login'>
                            {useAuth() ? <Redirect to='/dashboard'/> : <Auth/> }
                        </Route>
                        <Route path='/'> 
                            <Redirect to='/dashboard'/>
                        </Route>
                    </Switch>
                </AuthLoader>
            </Router>
        </ThemeProvider>
    );
};

export default App;