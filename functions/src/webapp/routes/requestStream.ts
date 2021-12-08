import * as functions from 'firebase-functions';

import {protos} from '@google-cloud/iot';

import {PeerConnection} from '../../lib/RTCPeerConnection';
import * as IoT from '../../lib/IoTClient';

export const requestStream = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
  }

  const offerDescription = await PeerConnection.createOffer();
  await PeerConnection.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  const request: protos.google.cloud.iot.v1.ISendCommandToDeviceRequest = {
    name: IoT.IoTClient.devicePath(IoT.gcpproject, IoT.cloudregion, IoT.registryid, data.deviceId),
    binaryData: Buffer.from(JSON.stringify(offer)),
  };

  IoT.IoTClient.sendCommandToDevice(request);
});
