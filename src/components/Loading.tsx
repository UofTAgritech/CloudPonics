import {FC} from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

const Loading:FC<{loading: boolean}> = ({loading, children}) => {
  return (
    <>
      {loading ? (
        <div style={{
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '2%'
        }}>
          <CircularProgress/>
        </div>
      ) : (
        <>
          {children}
        </>
      )}
    </>
  );
};

export default Loading;