// React engine
import { useEffect, useState, FC } from 'react';

// MUI Core
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

// MUI other
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

// Auth, Firebase
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, getFirestore } from '@firebase/firestore'
import {getFunctions, httpsCallable} from 'firebase/functions';

// My Components, Types
import DeviceCard, { DeviceCardProps } from './DeviceCard';
import SuccessAlert from './SuccessAlert';
import Loading from './Loading';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100vw',
      paddingLeft: '10%',
      paddingRight: '10%',
      justifyContent: 'center'
    },
    header: {
      padding: '2%',
      width: '100%',
      textAlign: 'center'
    }
  })
);

// Main Component
const DeviceGrid : FC = () => {
  const classes = useStyles();
  const user = useAuth();
  const deleteDevice = httpsCallable<{deviceid: string}, void>(getFunctions(), 'unregisterDevice');
  
  // Grid data state
  const [gridData, setGridData] = useState<DeviceCardProps[]>([]);
  useEffect(() => {
    return onSnapshot(query(collection(getFirestore(), 'devices'), where('owner', '==', user?.uid)), snapshot=>{
      const data = snapshot.docs.map(doc=>{
        return ({
          device: doc.data(), 
          docRef: doc.ref
        } as DeviceCardProps);
      });
      setGridData(data);
      setDevicesFetched(true);
    });
  }, [user]);
  
  // Delete success snackbar
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [devicesFetched, setDevicesFetched] = useState(false);
  const handleDeleteAlertOpen = () => {
    setDeleteAlert(true);
  };
  const handleDeleteAlertClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setDeleteAlert(false);
  };
  
  return (
    <Loading loading={!devicesFetched}>
      {gridData.length === 0 ? (
        <Box className={classes.header}>
          <Typography variant='h6'>
            No devices found for {user?.displayName ?? user?.email}!
          </Typography>
        </Box>
      ) : (<></>)}
      <Grid container spacing={3} className={classes.root}>
        {gridData.map((item, index) => {
          return (
            <DeviceCard 
              key={'devicecard-'+index} 
              {...item}
              deleteDevice={()=>{deleteDevice({deviceid: item.docRef.id}).then(handleDeleteAlertOpen)}}
            />
          );
        })}
        <SuccessAlert openState={deleteAlert} onClose={handleDeleteAlertClose}>
          Device deleted!
        </SuccessAlert>
      </Grid>
    </Loading>
  );
};
      
export default DeviceGrid;