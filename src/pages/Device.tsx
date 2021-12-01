import React, {FC, useEffect, useState} from 'react'
import {getFunctions, httpsCallable} from 'firebase/functions';
import {getFirestore, doc, getDoc, onSnapshot, collection, query, orderBy, limit, QuerySnapshot, DocumentData} from 'firebase/firestore';
import {Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import moment from 'moment';
import Loading from '../components/Loading';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);


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

  const datasetToTitle = (dataset: string) => dataset.split('-').map(word=>(word.charAt(0).toUpperCase()+word.substring(1))).join(' ');

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

  const updateDataFromQuerySnapshot = (dataset: string, snapshot: QuerySnapshot<DocumentData>, limit: number = 50) => {
    let newdata: {x: number, y: number}[] = [];
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        newdata = newdata.concat((change.doc.data() as PubSubData).batch.map(datum=>{
          return {x: datum.timestamp, y: datum.value};
        }));
      }
    });
    newdata.sort((a, b)=>{
      return a.x-b.x;
    }).slice(-limit);
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
        <Scatter key={'chart-'+dataset[0]} options={{
          responsive: true,
          scales: {
            x: {
              ticks: {
                callback: (value)=>formatTimestamps(value as number)
              },
              min: dataset[1][0].x,
            }
          },
          plugins: {
            legend: {
              position: 'top' as const,
            },
            // title: {
            //   display: true,
            //   text: datasetToTitle(dataset[0]),
            // },
          },
        }} data={{
          datasets: [
            {
              label: datasetToTitle(dataset[0]),
              data: dataset[1],
              showLine: true,
            }
          ]
        }} />
      ))}
    </Loading>
  )
}

export default Device;