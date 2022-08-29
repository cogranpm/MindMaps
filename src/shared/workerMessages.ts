import PouchDB from 'pouchdb-browser';
import { AnswerViewModel, AudioQueueItem, Leaf, LongText, MindMap, Test, TestRun } from '~src/forms/models/mindMaps/state';

//tell the worker which database to use
export enum LocalDatabase {
    MindMaps,
    Test,
    LongText,
    Blob
}

export type Content = {};
export type WorkerCallback = (e: Content) => void;


// discriminated union for message types 

export enum WorkerMessageTypes {
    Find,
    Remove,
    Get,
    Put,
    Init,
    Close,
    Sync,
    InitializeLeaf,
    PersistLeaf,
    LoadTestRuns,
    LoadAnswers,
    PersistTestRun
}

//tell the worker what operation to run
export type FindMessage = {
    id: string,
    type: WorkerMessageTypes.Find,
    request: PouchDB.Find.FindRequest<Content>,
    database: LocalDatabase
};

export type RemoveMessage = {
    id: string,
    type: WorkerMessageTypes.Remove,
    docId: PouchDB.Core.DocumentId,
    database: LocalDatabase
};

export type RemoveResult = {
    docId: string
}

export type GetMessage = {
    id: string,
    type: WorkerMessageTypes.Get,
    docId: PouchDB.Core.DocumentId,
    options?: PouchDB.Core.GetOptions,
    database: LocalDatabase
};

export type PutMessage = {
    id: string,
    type: WorkerMessageTypes.Put,
    doc: PouchDB.Core.PutDocument<Content>,
    options?: PouchDB.Core.PutOptions,
    database: LocalDatabase
};

export type InitMessage = {
    id: string,
    type: WorkerMessageTypes.Init
};

export type CloseMessage = {
    id: string,
    type: WorkerMessageTypes.Close
};

export type SyncMessage = {
    id: string,
    type: WorkerMessageTypes.Sync,
    remoteUrl: string,
    auth: PouchDB.Configuration.RemoteDatabaseConfiguration
};

export type InitializeLeafMessage = {
    id: string,
    leaf: Leaf,
    type: WorkerMessageTypes.InitializeLeaf,
};

export type InitializeLeafResponse = {
    body: LongText | undefined,
    snippet: LongText | undefined,
    mindMap: MindMap | undefined,
    test: Test | undefined,
    audioQueueItems: (AudioQueueItem | undefined)[];
};

export type PersistLeafMessage = {
    id: string,
    type: WorkerMessageTypes.PersistLeaf,
    leaf: Leaf,
    mindMap: MindMap,
    test: Test | undefined,
    body: LongText | undefined,
    snippet: LongText | undefined,
    // somehow need to send the audio blobs from the audio queue
    audioQueueItems: AudioQueueItem[] 
};

export type PersistLeafResponse = {
    updatedMindMap: MindMap,
    updatedBody: LongText | undefined,
    updatedSnippet: LongText | undefined,
    updatedTest: Test | undefined,
    updatedAudioQueue: AudioQueueItem[]
};

export type LoadTestRunsMessage = {
    id: string,
    type: WorkerMessageTypes.LoadTestRuns,
    leaf: Leaf
};

export type LoadAnswersMessage = {
    id: string,
    type: WorkerMessageTypes.LoadAnswers,
    test: Test,
    testRun: TestRun
};

export type PersistTestRunMessage = {
    id: string,
    type: WorkerMessageTypes.PersistTestRun,
    test: Test, 
    answers: AnswerViewModel[]
};

export type LoadTestRunsResponse = {
    test: Test,
    body: LongText,
    audioQueueItems: AudioQueueItem[]
}

export type WorkerMessage =
    PutMessage |
    GetMessage |
    RemoveMessage |
    FindMessage |
    InitMessage |
    CloseMessage |
    SyncMessage |
    InitializeLeafMessage |
    PersistLeafMessage |
    LoadTestRunsMessage |
    LoadAnswersMessage |
    PersistTestRunMessage;

