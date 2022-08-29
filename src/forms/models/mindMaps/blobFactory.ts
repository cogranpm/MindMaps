import { AudioQueueItem } from "./state"

export const makeAudioQueueItem = (ownerId: string, questionBlob?: Blob, answerBlob?: Blob, runBlob?: Blob): AudioQueueItem => {
    return { _id: ownerId, _rev: undefined, questionDirty: false, answerDirty: false, questionBlob: questionBlob, answerBlob: answerBlob, runBlob: runBlob };
};