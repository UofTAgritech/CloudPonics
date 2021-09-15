import { FC } from 'react';

import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import DeviceGrid from '../components/DeviceGrid';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        header: {
            paddingTop: '2%',
            paddingBottom: '1%',
            display: 'flex',
            width: '100vw',
            justifyContent: 'center',
            alignContent: 'center',
            textAlign: 'center'
        },
        grid: {
            display: 'flex',
            justifyContent: 'center',
            padding: theme.spacing(3)
        }
    }),
);

const Dashboard:FC = () => {
    const classes = useStyles();

    return (
        <div>
            <Box className={classes.header} >
                <Typography variant='h4'>
                    Manage Devices
                </Typography>
            </Box>
            <Box className={classes.grid}>
                <DeviceGrid />
            </Box>
        </div>
    );
};

export default Dashboard;