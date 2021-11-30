import * as functions from 'firebase-functions';
import {firestore} from 'firebase-admin';

export type PeerConnectionAnswer = {
  sdp: string | undefined,
  type: RTCSdpType,
}

export const requestStream = functions.https.onCall(async (data: PeerConnectionAnswer, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
  }

  const callDoc = firestore()
      .collection('devices').doc('p2p')
      .collection('streams').doc();

  callDoc.update({answer: data});
});
