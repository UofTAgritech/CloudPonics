// React engine
import { FC, useState, SyntheticEvent } from 'react';

// MUI Core
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

// MUI Other
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

// Auth, Firebase
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, getFirestore } from '@firebase/firestore';

// My Components, Types
import SignupForm, { ProduceSelection } from './SignupForm';
import GridCard from './GridCard';
import SuccessAlert from './SuccessAlert';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {
            margin: theme.spacing(1),
        },
    }),
);

const NewSubscription:FC = () => {
    const classes = useStyles();
    const user = useAuth()?.uid;
    
    // Dialog box open state
    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    
    const placeOrderAndClose = (selection: {[key: string]: ProduceSelection}, period: number, address: string): void => {
        // Place the order here
        handleClose();
        const list = Object.fromEntries(Object.entries(selection).map(entry=>{
            return [entry[0], entry[1].quantity];
        }));
        addDoc(collection(getFirestore(), 'subscriptions'), {
            owner: user,
            destination: address,
            period: period,
            source: 'Cluster Farm '+Math.floor(Math.random()*100+1),
            list: list 
        }).then(()=>{
            setAlert(true);
        });
    };
    
    const [alert, setAlert] = useState(false);
    
    const handleAlertClose = (event?: SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setAlert(false);
    };
    
    return (
        <>
            <GridCard>
                <Box>
                    <Button variant='contained' color='primary' className={classes.button} startIcon={<AddCircleOutlineIcon fontSize='large' />} onClick={handleClickOpen}>
                        New
                    </Button>
                </Box>
            </GridCard>
            <SignupForm openState={open} placeOrderAndClose={placeOrderAndClose} handleClose={handleClose} />
            <SuccessAlert openState={alert} onClose={handleAlertClose}>
                Order placed successfully!
            </SuccessAlert>
        </>
    );
};

export default NewSubscription;