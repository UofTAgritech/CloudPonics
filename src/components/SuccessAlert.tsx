import { FC } from 'react';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';

const SuccessAlert: FC<{openState: boolean, onClose: ()=>void}> = (props) => {
    return (
        <Snackbar open={props.openState} autoHideDuration={6000} onClose={props.onClose}>
            <MuiAlert elevation={6} variant="filled" onClose={props.onClose} severity="success">
                {props.children}
            </MuiAlert>
        </Snackbar>
    );
};

export default SuccessAlert;