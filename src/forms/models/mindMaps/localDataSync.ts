import PouchDB from 'pouchdb-browser';
import { SyncError } from '../../../shared/errorHandling';
import { mindMapsName, testName, blobName, longTextName, dbMindMaps, dbTest, dbBlob, dbLongText } from '../../../shared/localData';

export interface SyncReturnInfo {
    ok: boolean;
    info: SyncReturnMessage[];
};

export interface SyncReturnMessage {
    type: string;
    errors: any[];
};

export const replicate = async (remoteUrl: string, auth: PouchDB.Configuration.RemoteDatabaseConfiguration):
    Promise<Array<SyncReturnInfo>> => {

    function handleSyncResponse(syncResult: PouchDB.Replication.SyncResultComplete<{}>): SyncReturnInfo {
        const pull = syncResult.pull;
        const push = syncResult.push;
        const returnInfo: SyncReturnInfo = { ok: true, info: [] };
        if (pull && !pull.ok) {
            returnInfo.ok = false;
            returnInfo.info.push({ type: "pull", errors: pull.errors });
        }
        if (push && !push.ok) {
            returnInfo.ok = false;
            returnInfo.info.push({ type: "push", errors: push.errors });
        }
        return returnInfo;
    }

    async function syncDatabase(fromDb: PouchDB.Database, toDb: PouchDB.Database) {
        const options = { live: false, retry: false };
        const result = await fromDb.sync(toDb, options);
        return handleSyncResponse(result);
    }

    let newUrl = remoteUrl;
    if (remoteUrl[remoteUrl.length - 1] !== "/") {
        newUrl = remoteUrl + "/";
    }

    const remoteMindMap = `${newUrl}${mindMapsName}`;
    const remoteTest = `${newUrl}${testName}`;
    const remoteBlob = `${newUrl}${blobName}`;
    const remoteLongText = `${newUrl}${longTextName}`;

    const remoteMapsMindMapsDb = new PouchDB(remoteMindMap, auth);
    const remoteTestDb = new PouchDB(remoteTest, auth);
    const remoteBlobDb = new PouchDB(remoteBlob, auth);
    const remoteLongTextDb = new PouchDB(remoteLongText, auth);

    const mResult = await syncDatabase(dbMindMaps, remoteMapsMindMapsDb);
    const tResult = await syncDatabase(dbTest, remoteTestDb);
    const bResult = await syncDatabase(dbBlob, remoteBlobDb);
    const lResult = await syncDatabase(dbLongText, remoteLongTextDb);
    return Promise.all([mResult, tResult, bResult, lResult]);
};

export const makeReturnInfoFromError = (err: Error) => {
    const result = new Array<SyncReturnInfo>();
    const errorItem = {
        ok: false,
        info: [{
            type: "error",
            errors: [err as Error]
        }]
    };
    result.push(errorItem);
    return result;
}; 