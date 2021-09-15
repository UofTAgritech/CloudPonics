// React engine
import { useEffect, useState, FC } from 'react';

// MUI Core
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';

// MUI other
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

// Auth, Firebase
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, getFirestore } from '@firebase/firestore'

// My Components, Types
import DeviceCard, { DeviceCardProps } from './DeviceCard';
import NewSubscription from './NewSubscription';
import SuccessAlert from './SuccessAlert';

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

// Props
export type DeviceGridProps = {
    items?: DeviceCardProps[]
};

// Main Component
const DeviceGrid : FC<DeviceGridProps> = (props) => {
    const classes = useStyles();
    const user = useAuth();
    
    // Grid data state
    const [gridData, setGridData] = useState(props.items);
    useEffect(() => {
        return onSnapshot(query(collection(getFirestore(), 'devices'), where('owner', '==', user?.uid)), snapshot=>{
            const data = snapshot.docs.map(doc=>{
                return ({
                    item: doc.data(), 
                    docPath: doc.ref.path
                } as DeviceCardProps);
            });
            setGridData(data);
        });
    }, [user]);
    
    // Delete success snackbar
    const [deleteAlert, setDeleteAlert] = useState(false);
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
        <div>
            {gridData === undefined ? (
                <CircularProgress/>
            ) : (
                <>
                    {gridData.length === 0 ? (
                        <Box className={classes.header}>
                            <Typography variant='h6'>
                                No devices found for {user?.displayName}!
                            </Typography>
                        </Box>
                    ) : (<></>)}
                    <Grid container spacing={3} className={classes.root}>
                        {gridData.map((item, index) => {
                            return (
                                <DeviceCard 
                                    key={index} 
                                    item={item.item} 
                                    docPath={item.docPath} 
                                    deleteAlert={handleDeleteAlertOpen}
                                />
                            );
                        })}
                        <NewSubscription/>
                        <SuccessAlert openState={deleteAlert} onClose={handleDeleteAlertClose}>
                            Device deleted!
                        </SuccessAlert>
                    </Grid>
                </>
            )}
        </div>
    );
};
            
export default DeviceGrid;