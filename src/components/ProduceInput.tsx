import { FC, ChangeEvent } from 'react';

// MUI Core
import { Theme } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import TextField from '@material-ui/core/TextField';

// MUI Other
import createStyles from '@material-ui/styles/createStyles';
import makeStyles from '@material-ui/styles/makeStyles';

// Styles
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            margin: theme.spacing(3),
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
    })
);

// Props
interface ProduceInputProps {
    label: string;
    option: string;
    quantity: number;
    updateSelection: (option: string, quantity: number) => void;
}

// Main Component
const ProduceInput : FC<ProduceInputProps> = (props: ProduceInputProps) => {
    const handleChange = (event: ChangeEvent<{ value: string }>, option: string) => {
        props.updateSelection(option, Math.min(Math.max(Number(event.target.value), 0), 20));
    };
    
    const classes = useStyles();
    return (
        <FormControl className={classes.formControl}>
            <TextField
                type='number'
                label={props.label}
                value={props.quantity}
                onChange={(event)=>{handleChange(event, props.option);}}
                InputLabelProps={{shrink: true}}
            />
            <FormHelperText>
                Units per Day
            </FormHelperText>
        </FormControl>
    );
};
    
export default ProduceInput;