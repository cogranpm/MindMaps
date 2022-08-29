import { worker, workerCallbacks } from "~src/shared/workerClient";
import { Content, FindMessage, GetMessage, PutMessage, RemoveMessage } from "~src/shared/workerMessages";
import { SCENE_HEIGHT } from "../../../shared/constants";
import { dbMindMaps } from "../../../shared/localData";
import { uniqueId } from "../../../shared/uuid";
import { makeMindMap } from "./factories";
import { Leaf, MindMap, MindMapViewModel } from "./state";

/*
export const get = (message: GetMessage, callback: (e: Content) => void) => {
    workerCallbacks.set(message.id, callback);
    worker.postMessage(message);
};

export const find = (findMessage: FindMessage, callback: (e: Content) => void) => {
    workerCallbacks.set(findMessage.id, callback);
    worker.postMessage(findMessage);
};

export const remove = (removeMessage: RemoveMessage, callback: (e: Content) => void) => {
    workerCallbacks.set(removeMessage.id, callback);
    worker.postMessage(removeMessage);
}

export const put = (putMessage: PutMessage, callback: (e: Content) => void) => {
    workerCallbacks.set(putMessage.id, callback);
    worker.postMessage(putMessage);
}
*/

/*
export const loadMindmapByLeaf = async (leaf: Leaf): Promise<MindMap | undefined> => {
    const results = await dbMindMaps.find({
        selector: { "leafId": leaf.id }
    });
    if (results.docs.length === 0) {
        return undefined;
    } else {
        const firstResult = results.docs[0];
        return (firstResult as unknown) as MindMap;
    }
}

export const loadMindMap = (viewModel: MindMapViewModel): MindMap => {
    // if does not exist then
    return makeMindMap();
}
*/

/*
export async function persist(entity: MindMap): Promise<MindMap> {
    const response = await dbMindMaps.put(entity);
    if (response.ok) {
        return { ...entity, _id: response.id, _rev: response.rev };
    } else {
        throw new Error();
    }
}
*/

/*
export async function loadAll(): Promise<MindMapViewModel[]> {
    const results = await dbMindMaps.find({
        selector: {
            'name': { '$exists': true },
            'leafId': { '$exists': false }
        },
        sort: ['name'],
        fields: ['name', '_id', 'leafId']
    });

    // document may or may not have leafId
    // depending on whether or not it is a child of a leaf
    // we do not show children in the top level lists
    const entities = results.docs
        .filter((doc) => !doc.hasOwnProperty('leafId'))
        .map((doc) => {
            const model = (doc as unknown) as MindMapViewModel;
            return model;
        });

    return entities;
}


export async function remove(id: string) {
    let entity: MindMap | undefined = undefined;
    try {
        entity = await load(id);
    } catch (err) {
        entity = undefined;
    }
    if (entity) {
        const result = await dbMindMaps.remove(entity as PouchDB.Core.RemoveDocument);
        if (!result.ok) {
            throw new Error("document could not be deleted");
        }
    }
}

export async function load(id: string): Promise<MindMap> {
    const entity = await dbMindMaps.get(id) as MindMap;
    return entity;
}

export async function create(entity: MindMap): Promise<MindMap> {
    const response = await dbMindMaps.post(entity);
    if (response.ok) {
        return { ...entity, _id: response.id, _rev: response.rev };
    } else {
        throw new Error();
    }
}
*/
