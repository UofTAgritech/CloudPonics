import {DeviceManagerClient} from '@google-cloud/iot';

// Found at https://console.cloud.google.com/iot/registries
export const gcpproject = 'cloudponics-bc383';
export const cloudregion = 'us-central1';
export const registryid = 'CloudPonics';

// Client SDK
export const IoTClient = new DeviceManagerClient();

export const registryPath = IoTClient.registryPath(gcpproject, cloudregion, registryid);
