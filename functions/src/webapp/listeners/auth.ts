import * as functions from 'firebase-functions';
import {firestore} from 'firebase-admin';

export const newUser = functions.auth.user().onCreate((user, context)=>{
  return firestore().doc(`users/${user.uid}`).create({});
});

export const deleteUser = functions.auth.user().onDelete((user, context)=>{
  return [
    firestore().doc(`users/${user.uid}`).delete(), 
    firestore().collection('projects').where('owners', 'array-contains', user.uid).get().then(docs=>{
      docs.docs.forEach(doc=>{
        doc.ref.update({
          owners: firestore.FieldValue.arrayRemove(user.uid)
        })
      })
    })
  ];
});