// React engine
import { FC, useState, useEffect, ReactNode } from 'react';

// MUI Core
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';

// MUI Other
import { createStyles, makeStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';

// Auth, Firebase
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, getFirestore } from '@firebase/firestore';

// My Components, Types
import DeviceRegister from './DeviceRegister';

// Styles
const styles = (theme: Theme) => createStyles({
    root: {
        margin: 0,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    dialogPaper: {
        height: '60vh',
        minWidth: '40vw'
    },
    formControl: {
        margin: theme.spacing(3),
    }
});
const useStyles = makeStyles(styles);

// ===== Signup Dialog =====

// Types
type ProduceOption = {
    name: string,
    price: number
}
export type ProduceSelection = {
    quantity: number,
    option: ProduceOption
}

// Props
interface SignupProps {
    openState: boolean;
    placeOrderAndClose: (selection: {[id: string]: ProduceSelection}, period: number, address: string)=>void; 
    handleClose: ()=>void;
}

// Main component
const SignupForm: FC<SignupProps> = (props: SignupProps) => {
    const classes = useStyles();
    const user = useAuth();
    
    // Selection state
    const [selection, setSelection] = useState<{[id: string]: ProduceSelection}>({});

    useEffect(() => {
        getDocs(collection(getFirestore(), 'options')).then(docs=>{
            setSelection(Object.fromEntries(docs.docs.map(doc=>{
                return [doc.id, {
                    quantity: 0, 
                    option: {
                        name: doc.data().name, 
                        price: doc.data().price
                    }
                }];
            })));
        });
    }, [user]);

    const updateSelection = (option: string, quantity: number) => {
        const newstate = Object.fromEntries(Object.entries(selection));
        newstate[option].quantity = quantity;
        setSelection(newstate);
    };
    
    // Shipping states
    const [address, setAddress] = useState<string>('');
    const [period, setPeriod] = useState<number>(7);

    // Form state
    const resetForm = () => {
        for (const item of Object.entries(selection)) {
            updateSelection(item[0], 0);
        }
        setAddress('');
        setPeriod(7);
    };

    const incomplete = Object.values(selection).every(value=>{
        return value.quantity === 0;
    }) || address.length < 1;

    return (
        <div>
            <Dialog 
                onClose={props.handleClose} 
                aria-labelledby='customized-dialog-title' 
                open={props.openState} 
                scroll='paper' 
                classes={{ paper: classes.dialogPaper }} 
                maxWidth={'sm'}
            >
                <DialogTitle id='customized-dialog-title' onClose={props.handleClose}>
                    Create a New Subscription
                </DialogTitle>
                <DialogContent dividers>
                    <FormLabel component='legend'>Select Produce:</FormLabel>
                    <FormGroup>
                        {Object.entries(selection).map((option, index)=>{
                            return (
                                <DeviceRegister 
                                    key={index} 
                                    option={option[0]} 
                                    label={option[1].option.name+': $'+option[1].option.price} 
                                    quantity={option[1].quantity} 
                                    updateSelection={updateSelection}
                                />
                            );
                        })}
                    </FormGroup>
                    <FormLabel component='legend'>Select Shipping Period:</FormLabel>
                    <FormGroup>
                        <FormControl className={classes.formControl}>
                            <TextField
                                type='number'
                                value={period}
                                onChange={(event)=>{
                                    setPeriod(Math.min(Math.max(Number(event.target.value), 1),14));
                                }}
                                helperText='Days Between Shipments'
                            />
                        </FormControl>
                    </FormGroup>
                    <FormLabel component='legend'>Enter Shipping Address:</FormLabel>
                    <FormGroup>
                        <FormControl className={classes.formControl}>
                            <TextField 
                                placeholder='123 Main St., Springfield, USA' 
                                value={address} 
                                onChange={(event)=>{
                                    setAddress(event.target.value);
                                }}
                            />
                        </FormControl>
                    </FormGroup>
                </DialogContent>
                <DialogActions>
                    <Button 
                        autoFocus 
                        onClick={()=>{
                            props.placeOrderAndClose(selection, period, address); 
                            resetForm();
                        }} 
                        color='primary' 
                        disabled={incomplete}
                    >
                        Place Recurring Order
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};
        
// Dialog Stuff
const DialogContent = withStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
    },
}))(MuiDialogActions);

interface DialogTitleProps extends WithStyles<typeof styles> {
    id: string;
    children: ReactNode;
    onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant='h6'>
                {children}
            </Typography>
            {onClose ? (
                <IconButton aria-label='close' className={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

export default SignupForm;