/// <reference lib="WebWorker" />

import {
    FindMessage, GetMessage, InitializeLeafMessage,
    LoadAnswersMessage,
    LoadTestRunsMessage,
    PersistLeafMessage, PersistTestRunMessage, PutMessage,
    RemoveMessage, SyncMessage, WorkerMessage, WorkerMessageTypes
} from "~src/shared/workerMessages";
import { get, init, find, put, close, remove } from "~src/shared/databaseAdapter";
import { logMessage, logSystemError } from "~src/shared/errorHandling";
import { makeReturnInfoFromError, replicate } from "~src/forms/models/mindMaps/localDataSync";
//import { AudioQueueItem, Leaf, LeafType, LongText, LongTextType, MindMap, Test } from "~src/forms/models/mindMaps/state";
//import { loadTestAudio } from "~src/forms/models/mindMaps/modelHelpers/blobHelpers";
//import { dbBlob } from "~src/shared/localData";
//import { processLongText, persistLongText } from "~src/forms/models/mindMaps/modelHelpers/longTextHelper";
import { initializeLeaf, persistLeaf } from "~src/forms/models/mindMaps/modelHelpers/leafHelper";
import { loadAnswers, loadTestRuns, persistTestRun } from "~src/forms/models/mindMaps/modelHelpers/testRunHelper";

const ctx: Worker = self as any;

const worker_init = async (message: WorkerMessage) => {
    await init();
    ctx.postMessage({ id: message.id, result: "Database Initialized" });
};

const worker_find = async (message: WorkerMessage) => {
    const findMessage = message as FindMessage;
    const findResult = await find(findMessage.database, findMessage.request);
    ctx.postMessage({ id: message.id, result: findResult });
};

const worker_get = async (message: WorkerMessage) => {
    const getMessage = message as GetMessage;
    const getResult = await get(getMessage.database, getMessage.docId);
    ctx.postMessage({ id: message.id, result: getResult });
};

const worker_put = async (message: WorkerMessage) => {
    const putMessage = message as PutMessage;
    const putResult = await put(putMessage.database, putMessage.doc);
    //massage the passed in object
    if (putResult) {
        const newDoc = { ...putMessage.doc, _id: putResult.id, _rev: putResult.rev };
        ctx.postMessage({ id: message.id, result: newDoc });
    } else {
        ctx.postMessage({ id: message.id, result: undefined });
    }
};

const worker_remove = async (message: WorkerMessage) => {
    const removeMessage = message as RemoveMessage;
    await remove(removeMessage);
    ctx.postMessage({ id: message.id, result: { docId: removeMessage.docId } });
};

const worker_sync = async (message: WorkerMessage) => {
    const syncMessage = message as SyncMessage;
    try {
        const responses = await replicate(syncMessage.remoteUrl, syncMessage.auth);
        ctx.postMessage({ id: syncMessage.id, result: responses });
    } catch (err) {
        logSystemError(err, `Error in worker performing sync: ${syncMessage.remoteUrl}`);
        ctx.postMessage({ id: syncMessage.id, result: makeReturnInfoFromError(err as Error) });
    }
};

const worker_initLeaf = async (message: WorkerMessage) => {
    const leafMessage = message as InitializeLeafMessage;
    const response = await initializeLeaf(leafMessage.leaf);
    ctx.postMessage({ id: leafMessage.id, result: response });
};

const worker_persistLeaf = async (message: WorkerMessage) => {
    const persistMessage = message as PersistLeafMessage;
    const persistResponse = await persistLeaf(persistMessage);
    ctx.postMessage({ id: persistMessage.id, result: persistResponse });
};

const worker_loadTestRuns = async (message: WorkerMessage) => {
    const testRunResponse = await loadTestRuns(message as LoadTestRunsMessage);
    ctx.postMessage({ id: message.id, result: testRunResponse });
};

const worker_loadAnswers = async (message: WorkerMessage) => {
    const answerViewModel = await loadAnswers(message as LoadAnswersMessage);
    ctx.postMessage({ id: message.id, result: answerViewModel });
};

const worker_persistTestRun = async (message: WorkerMessage) => {
    const updatedTest = await persistTestRun(message as PersistTestRunMessage);
    ctx.postMessage({ id: message.id, result: updatedTest });
};


ctx.onmessage = async function(e: any) {
    const message = e.data as WorkerMessage;
    switch (message.type) {
        case WorkerMessageTypes.Init:
            worker_init(message);
            break;
        case WorkerMessageTypes.Close:
            await close();
            break;
        case WorkerMessageTypes.Find:
            worker_find(message);
            break;
        case WorkerMessageTypes.Get:
            worker_get(message);
            break;
        case WorkerMessageTypes.Put:
            worker_put(message);
            break;
        case WorkerMessageTypes.Remove:
            worker_remove(message);
            break;
        case WorkerMessageTypes.Sync:
            worker_sync(message);
            break;
        case WorkerMessageTypes.InitializeLeaf:
            worker_initLeaf(message);
            break;
        case WorkerMessageTypes.PersistLeaf:
            worker_persistLeaf(message);
            break;
        case WorkerMessageTypes.LoadTestRuns:
            worker_loadTestRuns(message);
            break;
        case WorkerMessageTypes.LoadAnswers:
            worker_loadAnswers(message);
            break;
        case WorkerMessageTypes.PersistTestRun:
            worker_persistTestRun(message);
            break;
        default:
            break;

    }
}


export default null;


