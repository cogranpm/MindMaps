import { AnswerViewModel, AudioQueueItem, Test } from '~src/forms/models/mindMaps/state';
import { logSystemError } from '~src/shared/errorHandling';
import { dbBlob } from '~src/shared/localData';
import { ANSWER_ATTACHMENT_KEY, MIME_TYPE_AUDIO, QUESTION_ATTACHMENT_KEY } from '../../../../shared/constants';
import { makeAudioQueueItem } from '../blobFactory';


export const loadTestAudio = async (test: Test, database: PouchDB.Database): Promise<(AudioQueueItem | undefined)[]> => {
    // there will be 1 audio blob record for each question
    const queueItems = test.questions.map(async (question) => {
        try {
            const doc = await database.get(question.id, { attachments: true });
            let audioQueueItem = makeAudioQueueItem(question.id, undefined, undefined, undefined);
            audioQueueItem.questionDirty = false;
            audioQueueItem.answerDirty = false;
            audioQueueItem._rev = doc._rev;
            if (doc._attachments) {
                if (doc._attachments[QUESTION_ATTACHMENT_KEY]) {
                    const blob = await database.getAttachment(question.id, QUESTION_ATTACHMENT_KEY) as Blob;
                    audioQueueItem.questionBlob = blob;
                }
                if (doc._attachments[ANSWER_ATTACHMENT_KEY]) {
                    const blob = await database.getAttachment(question.id, ANSWER_ATTACHMENT_KEY) as Blob;
                    audioQueueItem.answerBlob = blob;
                }
            }
            return audioQueueItem;
        } catch (err) {
            //no saved audio
            return undefined;
        }
    });
    const all = Promise.all(queueItems);
    return all;
};

export const persistTestAudio = async (audioQueueItems: AudioQueueItem[]) => {

    await audioQueueItems.reduce(async (promise, queuedAudioItem) => {
        // Note: copied this from https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop 
        // because of the vaguaries of asynchronous iteration
        // - the rest are comments from the post
        // This line will wait for the last async function to finish.
        // The first iteration uses an already resolved Promise
        // so, it will immediately continue.
        await promise;
        await persistAudioQueueItem(queuedAudioItem);
        // audioQueue is an in memory structure backed local data
        // the queue itself is not persisted, just the blobs it caches 
        queuedAudioItem.questionDirty = false;
        queuedAudioItem.answerDirty = false;
    }, Promise.resolve());

};



const persistAudioQueueItem = async (audioQueueItem: AudioQueueItem) => {
    const blobs = new Map<string, Blob>();
    if (audioQueueItem.questionBlob && audioQueueItem.questionDirty) {
        blobs.set(QUESTION_ATTACHMENT_KEY, audioQueueItem.questionBlob);
    }
    if (audioQueueItem.answerBlob && audioQueueItem.answerDirty) {
        blobs.set(ANSWER_ATTACHMENT_KEY, audioQueueItem.answerBlob);
    }
    persist(audioQueueItem._id, blobs);
};

export const persistTestRunAudio = async (answers: AnswerViewModel[]) => {
    for (const answer of answers) {
        if (answer.audioBlob) {
            const id = answer.answer.id;
            const blobs = new Map<string, Blob>();
            if (answer.audioBlobDirty) {
                blobs.set(ANSWER_ATTACHMENT_KEY, answer.audioBlob);
            }
            await persist(id, blobs);
        }
    }
};

export const loadTestRunAudio = async (id: string): Promise<Blob | undefined> => {
    const audioRecord = await get(id);
    if (audioRecord._attachments && audioRecord._attachments[ANSWER_ATTACHMENT_KEY]) {
        const blob = await dbBlob.getAttachment(id, ANSWER_ATTACHMENT_KEY) as Blob;
        return blob;
    }
    else {
        return undefined;
    }
}

const get = async (id: string) => {
    return await dbBlob.get(id, { attachments: true });
};

const getExisting = async (id: string) => {
    try {
        return await dbBlob.get(id, { attachments: true });
    } catch (err) {
        return undefined;
    }
}


const persist = async (id: string, blobs: Map<string, Blob>) => {

    let blobRecord = {
        _id: id,
        _rev: ""
    }
    const existing = await getExisting(id);
    if (existing) {
        if (existing._rev) {
            blobRecord._rev = existing._rev as string;
        }
    } else {
        //persist this blobRecord if it does not exist
        const result = await dbBlob.put(blobRecord);
        if (!result.ok) {
            logSystemError(new Error(), `Error creating Audio Blob record id: ${blobRecord._id}`);
            return;
        } else {
            blobRecord._rev = result.rev;
        }
    }

    for (const [key, blob] of blobs) {
        await putAttachment(blobRecord, blob, key);
    }
};

const putAttachment = async (
    doc: PouchDB.Core.Document<any>,
    blob: Blob,
    attachmentName: string
) => {
    const result = await dbBlob.putAttachment(doc._id, attachmentName, doc._rev, blob, MIME_TYPE_AUDIO);
    if (!result.ok) {
        logSystemError(new Error(), `Error updating Audio Blob record Attachment question id: ${doc._id}`);
    } else {
        doc._rev = result.rev;
    }
};

