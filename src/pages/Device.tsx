import React, {FC, useEffect, useState} from 'react'
import {getFunctions, httpsCallable} from 'firebase/functions';
import {getFirestore, doc, getDoc, onSnapshot, collection, query, orderBy, limit, QuerySnapshot, DocumentData} from 'firebase/firestore';
import {LineChart, XAxis, YAxis, Tooltip, CartesianGrid, Line} from 'recharts';
import moment from 'moment';
import { Typography } from '@material-ui/core';
import Loading from '../components/Loading';

type DevicePageProps = {
  deviceid: string
}

type DeviceDoc = {
  owner: string,
  name: string,
  latest: {
    project: string,
    run: string
  }
}

type PubSubData = {batch: {timestamp: number, value: number}[]};

const Device:FC<DevicePageProps> = (props) => {
  // const user = useAuth();
  const getDatasets = httpsCallable<{project: string, run: string}, string[]>(getFunctions(), 'getDatasets');
  const dataQuery = (project: string, run: string, dataset: string, batchlimit: number = 2) => query(collection(getFirestore(), `projects/${project}/runs/${run}/${dataset}`), orderBy('timestamp', 'desc'), limit(batchlimit));

  const [datasets, setDatasets] = useState<string[]>([]);
  const [devicedoc, setDevicedoc] = useState<DeviceDoc | null>(null);
  const [data, setData] = useState<{
    [key: string]: {
      x: number,
      y: number
    }[]
  }>({});

  const formatTimestamps = (tick: number) => moment(tick).format('LTS');

  // Setup
  useEffect(() => {
    // Get device doc (latest project+run)
    getDoc(doc(getFirestore(), `devices/${props.deviceid}`)).then(doc=>{
      let temp = doc.data() as DeviceDoc;
      setDevicedoc(temp);
      // Get list of datasets
      getDatasets({...(temp.latest)}).then(datasets=>{
        setDatasets(datasets.data);
      });
    });
  }, [])

  const updateDataFromQuerySnapshot = (dataset: string, snapshot: QuerySnapshot<DocumentData>) => {
    let newdata: {x: number, y: number}[] = [];
    snapshot.docs.forEach(doc=>{
      newdata = newdata.concat((doc.data() as PubSubData).batch.map(datum=>{
        return {x: datum.timestamp, y: datum.value};
      }));
    })
    newdata.sort((a, b)=>{
      return a.x-b.x;
    })
    setData((old)=>{
      console.log(old);
      return ({...old, [dataset]: (old[dataset] ?? []).concat(newdata).slice(-limit)})
    });
  }
  
  // Initial data and on data updates
  // Todo: datapoint uniqueness?
  useEffect(() => {
    if(devicedoc){
      const unsubs = datasets.map(dataset=>{
        return onSnapshot(dataQuery(devicedoc.latest.project, devicedoc.latest.run, dataset), snapshot=>{
          updateDataFromQuerySnapshot(dataset, snapshot);
        });
      })
      // Unsub from all
      return () => {
        unsubs.forEach(unsub=>{unsub()});
      }
    }
  }, [datasets, devicedoc]);
  

  return (
    <Loading loading={Object.entries(data).length === 0}>
      {Object.entries(data).map((dataset)=>(
        <>
          <Typography>
            {dataset[0]}
          </Typography>
          <LineChart
            key={'chart-'+dataset[0]}
            width={1000}
            height={400}
            data={dataset[1]}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <XAxis dataKey="x" tickFormatter={formatTimestamps}/>
            <YAxis/>
            <Tooltip />
            <CartesianGrid stroke="#f5f5f5" />
            <Line type="monotone" dataKey="y" stroke="#ff7300" yAxisId={0} />
          </LineChart>
        </>
      ))}
    </Loading>
  )
}

export default Device;