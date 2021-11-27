import React, {FC, useEffect, useState} from 'react'
import {getFunctions, httpsCallable} from 'firebase/functions';
import {getFirestore, doc, getDoc, onSnapshot, collection} from 'firebase/firestore';
// import { useAuth } from '../contexts/AuthContext';

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

  // Get datasets
  useEffect(() => {
    getDoc(doc(getFirestore(), `devices/${props.deviceid}`)).then(devicedoc=>{
      console.log(devicedoc.data());
      setDevicedoc(devicedoc.data() as DeviceDoc);
      getDatasets({...devicedoc.data()?.latest}).then(datasets=>{
        console.log(datasets);
        setDatasets(datasets.data);
      });
    });
  }, [])

  
  useEffect(() => {
    let unsubs = datasets.map(dataset=>{
      return onSnapshot(collection(getFirestore(), `projects/${devicedoc?.latest.project}/runs/${devicedoc?.latest.run}/${dataset}`), snapshot=>{
        snapshot.docs.forEach(doc=>{
          let newdata = {...data};
          newdata[dataset] = (doc.data() as PubSubData).batch.map(datum=>{
            return {x: datum.timestamp, y: datum.value};
          });
          setData(newdata);
          console.log(newdata);
        })
      });
    })
    // Unsub from all
    return () => {
      unsubs.forEach(unsub=>{unsub()});
    }
  }, [datasets]);
  

  return (
    <div>
      {props.deviceid}
    </div>
  )
}

export default Device;