// React engine
import { useState, FC } from 'react';
import { useHistory } from 'react-router-dom';

// MUI core
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

// MUI other
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

// My Components, Types
import GridCard from './GridCard';
import { DocumentReference } from '@firebase/firestore';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
    },
    buttonbox: {
      padding: theme.spacing(1)
    },
    textbox: {
      padding: '.5em',
      flexGrow: 1,
      verticalAlign: 'top'
    },
    titlebox: {
      fontWeight: 'bold'
    }
  }),
);

export type DeviceCardProps = {
  device: {
    owner: string,
    name: string
  },
  docRef: DocumentReference,
  deleteDevice: ()=>void
}

const DeviceCard:FC<DeviceCardProps> = (props) => {
  const classes = useStyles();
  let history = useHistory();

  const gotoDevice = () => {
    history.push(`/devices/${props.docRef.id}`)
  }
  
  // Delete confirmation dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const handleDeleteOpen = () => {
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };
  const handleCancelAndClose = () => {
    handleDeleteClose();
    props.deleteDevice();
  };
  
  return (
    <GridCard>
      <Typography variant='h6' className={classes.title}>
        <Box className={classes.titlebox}>
          {props.device.name}
        </Box>
      </Typography>
      <Box className={classes.textbox}>
        <Typography variant='body2'>
          {props.docRef.id}
        </Typography>
      </Box>
      <Box className={classes.buttonbox}>
        <Button variant='contained' color='primary' onClick={gotoDevice}>
          View
        </Button>
        <Button variant='contained' color='secondary' onClick={handleDeleteOpen}>
          Delete
        </Button>
      </Box>
      <Dialog
        open={deleteOpen}
        onClose={handleDeleteClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{`Unregister device ${props.docRef.id}?`}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            This device will be unregistered immediately. It will no longer be able to publish data or be remotely monitored and configured, and any in-progress runs being done by the device will be stopped.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} color='inherit'>
            Cancel
          </Button>
          <Button onClick={handleCancelAndClose} color='secondary' autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </GridCard>
  );
};

export default DeviceCard;