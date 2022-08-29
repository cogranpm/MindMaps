/**********************
 * contains generic functions for calling PouchDB equivalents 
 * is required as the local database workers needs  
 * for example to run a get call in many contexts 
 */

import PouchDB from 'pouchdb-browser';
import pouchFind from 'pouchdb-find';
import { makeLongText } from '~src/forms/models/mindMaps/factories';
import { Leaf, LongText, LongTextType, Test } from '~src/forms/models/mindMaps/state';
import { logSystemError } from './errorHandling';
import { closeLocalDatabases, dbBlob, dbLongText, dbMindMaps, dbTest, initializeLocalDatabases } from './localData';
import {
    LocalDatabase,
    PutMessage,
    RemoveMessage,
    Content
} from './workerMessages';

const getDatabase = (database: LocalDatabase): PouchDB.Database<{}> | undefined => {
    switch (database) {
        case LocalDatabase.Blob:
            return dbBlob;
        case LocalDatabase.LongText:
            return dbLongText;
        case LocalDatabase.Blob:
            return dbBlob;
        case LocalDatabase.Test:
            return dbTest;
        case LocalDatabase.MindMaps:
            return dbMindMaps;
        default:
            return undefined;
    }
};


export const get = async (localDatabase: LocalDatabase, docId: PouchDB.Core.DocumentId) => {
    const database = getDatabase(localDatabase);
    if (database) {
        try {
            return await database.get(docId);
        } catch (err) {
            return undefined;
        }
    };
};


export const put = async (localDatabase: LocalDatabase, doc: PouchDB.Core.PutDocument<Content>): Promise<PouchDB.Core.Response | undefined> => {
    const database = getDatabase(localDatabase);
    if (database) {
        return await database.put(doc);
    } else {
        return undefined;
    }
};

export const find = async (localDatabase: LocalDatabase, request: PouchDB.Find.FindRequest<Content>)
    : Promise<PouchDB.Find.FindResponse<{}> | undefined> => {
    const database = getDatabase(localDatabase);
    if (database) {
        return await database.find(request);
    } else {
        return undefined;
    }
};



export const remove = async (message: RemoveMessage) => {
    const database = getDatabase(message.database);
    if (database) {
        try {
            const doc = await database.get(message.docId);
            const result = await database.remove(doc as PouchDB.Core.RemoveDocument);
            if (!result.ok) {
                logSystemError(new Error("Document could not be deleted"), `${message.docId}`);
            }
        } catch (err) {
            logSystemError(err, `Could not find document to delete: ${message.docId}`);
        }
    }
};

export const init = async () => {
    await initializeLocalDatabases();
};

export const close = async () => {
    await closeLocalDatabases();
};

