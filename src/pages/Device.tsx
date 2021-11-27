import React, {FC, useEffect, useState} from 'react'
import {getFunctions, httpsCallable} from 'firebase/functions';
import {getFirestore, doc, getDoc, onSnapshot, collection, query, orderBy, limit} from 'firebase/firestore';
import {LineChart, XAxis, YAxis, Tooltip, CartesianGrid, Line} from 'recharts';
import moment from 'moment';
import { Typography } from '@material-ui/core';

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

  const [datasets, setDatasets] = useState<string[]>([]);
  const [devicedoc, setDevicedoc] = useState<DeviceDoc | null>(null);
  const [data, setData] = useState<{
    [key: string]: {
      x: number,
      y: number
    }[]
  }>({});

  const formatTimestamps = (tick: number) => moment(tick).format('LTS');

  // Get datasets
  useEffect(() => {
    getDoc(doc(getFirestore(), `devices/${props.deviceid}`)).then(devicedoc=>{
      setDevicedoc(devicedoc.data() as DeviceDoc);
      getDatasets({...devicedoc.data()?.latest}).then(datasets=>{
        setDatasets(datasets.data);
      });
    });
  }, [])

  const appendData = (dataset: string, newdata: {x: number, y: number}[], limit: number = 0) => {
    setData((old)=>{
      console.log(old);
      return ({...old, [dataset]: (old[dataset] ?? []).concat(newdata).slice(-limit)})
    });
  }
  
  useEffect(() => {
    const unsubs = datasets.map(dataset=>{
      return onSnapshot(query(collection(getFirestore(), `projects/${devicedoc?.latest.project}/runs/${devicedoc?.latest.run}/${dataset}`), orderBy('timestamp', 'desc'), limit(2)), snapshot=>{
        let newdata: {x: number, y: number}[] = [];
        snapshot.docs.forEach(doc=>{
          newdata = newdata.concat((doc.data() as PubSubData).batch.map(datum=>{
            return {x: datum.timestamp, y: datum.value};
          }));
        })
        newdata.sort((a, b)=>{
          return a.x-b.x;
        })
        appendData(dataset, newdata, 100);
      });
    })
    // Unsub from all
    return () => {
      unsubs.forEach(unsub=>{unsub()});
    }
  }, [datasets]);
  

  return (
    <>{Object.entries(data).map((dataset)=>(
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
      )
    )}</>
  )
}

export default Device;