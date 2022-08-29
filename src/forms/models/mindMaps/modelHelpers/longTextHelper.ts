import { find } from "~src/shared/databaseAdapter";
import { dbLongText } from "~src/shared/localData";
import { LocalDatabase } from "~src/shared/workerMessages";
import { makeLongText } from "../factories";
import { Leaf, LongText, LongTextType } from "../state";

export const processLongText = async (leaf: Leaf, type: LongTextType) => {
    let longText: LongText | undefined = undefined;
    const findResult = await find(LocalDatabase.LongText, {
        selector: { "ownerId": leaf.id, type: type }
    });
    if (findResult) {
        if (findResult.docs.length !== 0) {
            const firstResult = findResult.docs[0];
            longText = (firstResult as unknown) as LongText;
        }
    }
    if (!longText) {
        longText = makeLongText(leaf.id, type);
    }
    return longText;
};

export const persistLongText = async (entity: LongText) => {
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
};

export async function createLongText(entity: LongText): Promise<LongText> {
    const response = await dbLongText.post(entity);
    if (response.ok) {
        return { ...entity, _id: response.id, _rev: response.rev };
    } else {
        throw new Error();
    }
}

export const getLongText = async (leafBody: LongText): Promise<LongText | undefined> => {
    return await dbLongText.get(leafBody._id);
}



