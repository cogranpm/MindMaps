import { find, get, put } from "~src/shared/databaseAdapter";
import { dbBlob } from "~src/shared/localData";
import { InitializeLeafResponse, LocalDatabase, PersistLeafMessage, PersistLeafResponse } from "~src/shared/workerMessages";
import { AudioQueueItem, Leaf, LeafType, LongText, LongTextType, MindMap, Test } from "../state";
import { loadTestAudio, persistTestAudio } from "./blobHelpers";
import { persistLongText, processLongText } from "./longTextHelper";
import { persist as persistTest } from "~src/forms/models/mindMaps/modelHelpers/testHelper";

export const initializeLeaf = async (leaf: Leaf): Promise<InitializeLeafResponse> => {

    const bodyText: LongText | undefined = await processLongText(leaf, LongTextType.Body);
    let mindMap: MindMap | undefined;
    let snippet: LongText | undefined = undefined;
    let test: Test | undefined = undefined;
    let audioQueueItems: (AudioQueueItem | undefined)[] = new Array();
    switch (leaf.type) {
        case LeafType.Test:
            const testFindResult = await get(LocalDatabase.Test, leaf.id);
            if (testFindResult) {
                test = testFindResult as Test;
                audioQueueItems = await loadTestAudio(test, dbBlob);
            }
            break;
        case LeafType.MindMap:
            const mindMapFindResult = await find(LocalDatabase.MindMaps, {
                selector: { leafId: leaf.id }
            });
            if (mindMapFindResult) {
                const firstResult = mindMapFindResult.docs[0];
                if (firstResult) {
                    mindMap = firstResult as unknown as MindMap;
                }
            }
            break;
        case LeafType.Snippet:
            snippet = await processLongText(leaf, LongTextType.Snippet);
            break;
        default:
    }

    //aggregate the results
    const response = {
        body: bodyText,
        snippet: snippet,
        mindMap: mindMap,
        test: test,
        audioQueueItems: audioQueueItems
    };
    return response;
};

export const persistLeaf = async (persistMessage: PersistLeafMessage): Promise<PersistLeafResponse> => {
    const persistResult = await put(LocalDatabase.MindMaps, persistMessage.mindMap);
    let updatedMindMap: MindMap | undefined = undefined;
    let updatedBody: LongText | undefined = undefined;
    let updatedSnippet: LongText | undefined = undefined;
    let updatedTest: Test | undefined = undefined;

    if (persistResult) {
        updatedMindMap = { ...persistMessage.mindMap, _id: persistResult.id, _rev: persistResult.rev };
    }
    if (persistMessage.body) {
        updatedBody = await persistLongText(persistMessage.body);
    }
    switch (persistMessage.leaf.type) {
        case LeafType.Test:
            if (persistMessage.test) {
                updatedTest = await persistTest(persistMessage.test);
                await persistTestAudio(persistMessage.audioQueueItems);
            }
            break;
        case LeafType.Snippet:
            if (persistMessage.snippet) {
                updatedSnippet = await persistLongText(persistMessage.snippet);
            }
            break;
        default:
    }
    const response = {
        updatedMindMap: updatedMindMap,
        updatedBody: updatedBody,
        updatedSnippet: updatedSnippet,
        updatedTest: updatedTest,
        updatedAudioQueue: persistMessage.audioQueueItems
    } as PersistLeafResponse;
    return response;
};

