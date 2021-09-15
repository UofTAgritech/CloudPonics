import { FC } from 'react';
import { signInWithRedirect, getAuth, GoogleAuthProvider } from 'firebase/auth'
import { Box, Button, Theme } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '20vh'
        },
    })
);

const Auth:FC = () => {
    const classes = useStyles();
    const google = new GoogleAuthProvider();
    return (
        <Box className={classes.root}>
            <Button variant="contained" onClick={()=>signInWithRedirect(getAuth(), google)}>
                Sign In With Google
            </Button>
        </Box>
    );
};

export default Auth;