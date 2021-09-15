import { FC } from 'react';
import Paper from '@material-ui/core/Paper';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'center',
            padding: theme.spacing(3),
            color: theme.palette.text.secondary,
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '20em'
        },
    })
);

const GridCard:FC = ({children}) => {
    const classes = useStyles();
    return (
        <Grid item xs={12} sm={6} md={3}>
            <Paper className={classes.paper} elevation={5}>
                {children}
            </Paper>
        </Grid>
    );
};

export default GridCard;