import { FC } from 'react';
// import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
// import { getAuth, GoogleAuthProvider, FacebookAuthProvider, EmailAuthProvider } from 'firebase/auth'
import { Box, Theme } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';

// const uiConfig: firebaseui.auth.Config = {
//     signInFlow: 'redirect',
//     signInOptions: [
//         GoogleAuthProvider.PROVIDER_ID,
//         FacebookAuthProvider.PROVIDER_ID,
//         EmailAuthProvider.PROVIDER_ID
//     ]
// };

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
    return (
        <Box className={classes.root}>
            {/* <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={getAuth()} /> */}
        </Box>
    );
};

export default Auth;