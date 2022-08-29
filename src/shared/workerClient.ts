export let worker: Worker;
import { AnswerViewModel, AudioQueueItem, Leaf, LeafType, LongText, MindMap, Test, TestRun } from '~src/forms/models/mindMaps/state';
import { FETCH_ID_CLOSEDATABASE, 
    FETCH_ID_INITDATABASE, 
    FETCH_ID_INITIALIZELEAF, 
    FETCH_ID_LOADTESTRUN, 
    FETCH_ID_LOADANSWERS, 
    FETCH_ID_PERSISTLEAF,
    FETCH_ID_PERSISTTESTRUN, 
    } from './constants';
import { logSystemError, logMessage } from './errorHandling';
import {
    WorkerCallback,
    CloseMessage,
    Content,
    FindMessage,
    GetMessage,
    InitMessage,
    LocalDatabase,
    PutMessage,
    RemoveMessage,
    WorkerMessageTypes,
    SyncMessage,
    InitializeLeafMessage,
    PersistLeafMessage,
    LoadTestRunsMessage,
    LoadAnswersMessage
} from './workerMessages';

export const workerCallbacks = new Map<string, (e: any) => void>();

export const startDatabaseWorker = async () => {
    worker = new Worker(
        new URL("../public/workers/worker.ts", import.meta.url),
        { type: "module" }
    );

    worker.onmessage = (e: any) => {
        if (e.data.hasOwnProperty("id")) {
            const id = e.data.id;
            if (id) {
                const callback = workerCallbacks.get(id);
                if (callback) {
                    callback(e.data.result);
                }
            }
        }
    };

    worker.onerror = (e) => {
        logSystemError(e, "Error from web worker");
    };

    worker.addEventListener("error", (e: any) => {
        logMessage(`worker error`);
    });

};

export const initializeLocalDatabases = async () => {
    worker.postMessage({ id: FETCH_ID_INITDATABASE, type: WorkerMessageTypes.Init } as InitMessage);
}

export const closeLocalDatabases = async () => {
    worker.postMessage({ id: FETCH_ID_CLOSEDATABASE, type: WorkerMessageTypes.Close } as CloseMessage);
}

export const persist = (fetchId: string, mindMap: MindMap, callback: WorkerCallback) => {
    const putMessage: PutMessage = {
        id: fetchId,
        type: WorkerMessageTypes.Put,
        doc: mindMap,
        database: LocalDatabase.MindMaps,
    };
    workerCallbacks.set(putMessage.id, callback);
    worker.postMessage(putMessage);
};

export const find = (fetchId: string, findRequest: PouchDB.Find.FindRequest<Content>, callback: WorkerCallback) => {
    const request = {
        id: fetchId,
        type: WorkerMessageTypes.Find,
        request: findRequest,
        database: LocalDatabase.MindMaps,
    } as FindMessage;
    workerCallbacks.set(request.id, callback);
    worker.postMessage(request);
};

export const get = (docId: string, fetchId: string, callback: WorkerCallback) => {
    const getMessage = {
        id: fetchId,
        type: WorkerMessageTypes.Get,
        docId: docId,
        database: LocalDatabase.MindMaps,
    } as GetMessage;
    workerCallbacks.set(getMessage.id, callback);
    worker.postMessage(getMessage);

}

export const remove = (docId: string, fetchId: string, callback: WorkerCallback) => {
    const removeMessage: RemoveMessage = {
        id: fetchId,
        type: WorkerMessageTypes.Remove,
        docId: docId,
        database: LocalDatabase.MindMaps,
    };
    workerCallbacks.set(removeMessage.id, callback);
    worker.postMessage(removeMessage);
}

export const sync = (
    fetchId: string,
    remoteUrl: string,
    auth: PouchDB.Configuration.RemoteDatabaseConfiguration,
    callback: WorkerCallback) => {
    const syncMessage: SyncMessage = {
        id: fetchId,
        type: WorkerMessageTypes.Sync,
        auth: auth,
        remoteUrl: remoteUrl
    };
    workerCallbacks.set(syncMessage.id, callback);
    worker.postMessage(syncMessage);
};

export const initializeLeaf = (leaf: Leaf, callback: WorkerCallback) => {
    const message: InitializeLeafMessage = {
        id: FETCH_ID_INITIALIZELEAF,
        type: WorkerMessageTypes.InitializeLeaf,
        leaf: leaf
    };
    workerCallbacks.set(message.id, callback);
    worker.postMessage(message);
};

export const persistLeaf = (
    leaf: Leaf,
    mindMap: MindMap,
    test: Test | undefined,
    body: LongText | undefined,
    snippet: LongText | undefined,
    audioQueue: Map<string, AudioQueueItem>,
    callback: WorkerCallback) => {

    let audioQueueItems = new Array<AudioQueueItem | undefined>();
    if (test) {
        audioQueueItems = test.questions.map((question) => {
            if (audioQueue.has(question.id)) {
                const queuedAudioItem = audioQueue.get(question.id) as AudioQueueItem;
                if (queuedAudioItem.questionDirty || queuedAudioItem.answerDirty) {
                    return queuedAudioItem;
                }
            }
        });
    }

    const message = {
        id: FETCH_ID_PERSISTLEAF,
        type: WorkerMessageTypes.PersistLeaf,
        leaf: leaf,
        mindMap: mindMap,
        test: test,
        body: body,
        snippet: snippet,
        audioQueueItems: audioQueueItems.filter((item) => item !== undefined)
    } as PersistLeafMessage;

    workerCallbacks.set(message.id, callback);
    worker.postMessage(message);
};

export const loadTestRuns = (leaf: Leaf, callback: WorkerCallback) => {
    const message = {
        id: FETCH_ID_LOADTESTRUN,
        type: WorkerMessageTypes.LoadTestRuns,
        leaf: leaf
    } as LoadTestRunsMessage;
    workerCallbacks.set(message.id, callback);
    worker.postMessage(message);
};

export const loadAnswers = (test: Test, testRun: TestRun, callback: WorkerCallback) => {
    const message = {
        id: FETCH_ID_LOADANSWERS,
        type: WorkerMessageTypes.LoadAnswers,
        test: test,
        testRun: testRun
    } as LoadAnswersMessage;
    workerCallbacks.set(message.id, callback);
    worker.postMessage(message);
};

export const persistTestRun = (test: Test, answers: AnswerViewModel[], callback: WorkerCallback) => {
    const message = {
        id: FETCH_ID_PERSISTTESTRUN,
        type: WorkerMessageTypes.PersistTestRun,
        test: test,
        answers: answers
    }
    workerCallbacks.set(message.id, callback);
    worker.postMessage(message);
};