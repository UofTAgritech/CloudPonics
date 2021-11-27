import * as functions from 'firebase-functions';
import {firestore} from 'firebase-admin';

import {devices} from './devicelist';

// Message Attributes:
// - `deviceid`: ID of device as it appears in IoT registry AND Firestore document
// - `owner`: UID of user who registered the device

type PubSubData = {
  [key: string]: {
    batch: {
      timestamp: number,
      value: number
    }[]
  }
}

export const dataPubSubListener = functions.pubsub.topic('data').onPublish(async (message)=>{
  // try {
  //   let temp = message.json;
  // } catch (e) {
  //   functions.logger.error('PubSub message was not JSON', e);
  //   return;
  // }

  // TODO: Send STOP command (or something like that) on fatal errors

  if (!message.json || !message.json.metadata.owner || !message.json.metadata.project || !message.json.metadata.run) {
    functions.logger.error(`Device published incomplete message.`, message);
    return;
  }

  if (!Object.keys(devices).includes(message.attributes.deviceId)) {
    functions.logger.error(`Unregistered device '${message.attributes.deviceId}' attempted to publish data.`, devices);
    return;
  }

  if (devices[message.attributes.deviceId].owner != message.json.metadata.owner) {
    functions.logger.error(`Decvice '${message.attributes.deviceId}' and`+
      ` owner '${message.json.metadata.owner}' do not match records.`, devices);
    return;
  }

  const data = message.json.data as PubSubData;

  const rundoc = await firestore().doc(`projects/${message.json.metadata.project}/runs/${message.json.metadata.run}`)
      .get();

  // Create run document
  if (!rundoc.exists) {
    rundoc.ref.create({
      owner: message.json.metadata.owner,
      device: message.attributes.deviceId,
    });
  }

  // New project?
  if (devices[message.attributes.deviceId].latest.project != message.json.metadata.project ||
    devices[message.attributes.deviceId].latest.run != message.json.metadata.run) {
    await firestore().doc(`devices/${message.attributes.deviceId}`).update({
      latest: {
        project: message.json.metadata.project,
        run: message.json.metadata.run,
      },
    });
  }

  return Object.keys(data).map((label)=>
    firestore().collection(`projects/${message.json.metadata.projectid}/runs/${message.json.metadata.runid}/${label}/`)
        .add(data[label])
  );
});
