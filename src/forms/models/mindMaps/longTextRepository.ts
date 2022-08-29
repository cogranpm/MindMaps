/*

import { dbLongText } from "../../../shared/localData";
import { Leaf, LongText, LongTextType  } from "./state";


export const loadLongText = async (ownerId: string, type: LongTextType) => {
    const results = await dbLongText.find({
        selector: { "ownerId": ownerId, type: type }
    });
    if (results.docs.length === 0) {
        return undefined;
    } else {
        const firstResult = results.docs[0];
        return (firstResult as unknown) as LongText;
    }
};

export const loadSnippet = async (leaf: Leaf): Promise<LongText | undefined> => {
    return await loadLongText(leaf.id, LongTextType.Snippet);
}

export const loadLeafBody = async (leaf: Leaf): Promise<LongText | undefined> => {
    return await loadLongText(leaf.id, LongTextType.Body);
}

export const getLongText = async (leafBody: LongText): Promise<LongText | undefined> => {
    return await dbLongText.get(leafBody._id);
}

export const persistLongText = async (entity: LongText): Promise<LongText> => {
    let existing: LongText | undefined = undefined;
    try {
        existing = await getLongText(entity);
    } catch (e) {
        //expected if not exists
    }
    if (!existing) {
        return await createLongText(entity);
    } else {
        const response = await dbLongText.put(entity);
        if (response.ok) {
            return { ...entity, _id: response.id, _rev: response.rev };
        } else {
            throw new Error();
        }
    }
}

export async function createLongText(entity: LongText): Promise<LongText> {
    const response = await dbLongText.post(entity);
    if (response.ok) {
        return { ...entity, _id: response.id, _rev: response.rev };
    } else {
        throw new Error();
    }
}

*/