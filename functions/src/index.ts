import * as admin from 'firebase-admin';
admin.initializeApp();

export {deviceCreationListener, deviceDeletionListener} from './device/listeners/devicelist';
export * from './device/listeners/pubsub';
export * from './device/routes/registerDevice';
