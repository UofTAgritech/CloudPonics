import * as functions from 'firebase-functions';

import {PeerConnection} from '../../lib/RTCPeerConnection';
import {PubSubClient} from '../../lib/PubSub';

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

  PubSubClient.topic('events').publishMessage({json: offer});
});
