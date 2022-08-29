
import PouchDB from 'pouchdb-browser';
import pouchFind from 'pouchdb-find';
import { DB_PREFIX } from './constants';
import { logSystemError } from './errorHandling';

export const lookupName = `${DB_PREFIX}-lookups`;
export const mindMapsName = `${DB_PREFIX}-mindmaps`;
export const longTextName = `${DB_PREFIX}-longtext`;
export const blobName = `${DB_PREFIX}-blob`;
export const testName = `${DB_PREFIX}-test`;

export let dbLookups: PouchDB.Database<{}>;
export let dbMindMaps: PouchDB.Database<{}>;
export let dbLongText: PouchDB.Database<{}>;
export let dbBlob: PouchDB.Database<{}>;
export let dbTest: PouchDB.Database<{}>;

export async function initializeLocalDatabases() {
    try {
        PouchDB.plugin(pouchFind);
        dbLookups = new PouchDB(lookupName);
        dbMindMaps = new PouchDB(mindMapsName);
        dbLongText = new PouchDB(longTextName);
        dbBlob = new PouchDB(blobName);
        dbTest = new PouchDB(testName);

        await dbLookups.createIndex({
            index: { fields: ['name'] }
        });

        await dbMindMaps.createIndex({
            index: { fields: ['name', 'leafId'] }
        });

        await dbLongText.createIndex({
            index: { fields: ['ownerId', 'type'] }
        });

        await dbBlob.createIndex({
            index: { fields: ['ownerId', 'type'] }
        });

        await dbTest.createIndex({
            index: { fields: ['leafId'] }
        });

    } catch (error) {
        let message = "Error on initializing local database";
        logSystemError(error, message);
    }
}

export async function closeLocalDatabases() {
    try {
        await dbLookups.close();
        await dbMindMaps.close();
        await dbLongText.close();
        await dbTest.close();
        await dbBlob.close();
    } catch (error) {
        let message = "Error on closing local database";
        logSystemError(error, message);
    }
}