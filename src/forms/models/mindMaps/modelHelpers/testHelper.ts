import { dbTest } from "~src/shared/localData";
import { Test } from "../state";

// the id is a leaf
export const get = async (id: string): Promise<Test | undefined> => {
    try {
        return await dbTest.get(id);
    } catch (err) {
        return undefined;
    }
}

export const persist = async (entity: Test): Promise<Test> => {
    let existing: Test | undefined = undefined;
    existing = await get(entity._id);
    if (!existing) {
        return await create(entity);
    } else {
        const response = await dbTest.put(entity);
        if (response.ok) {
            return { ...entity, _id: response.id, _rev: response.rev };
        } else {
            throw new Error();
        }
    }
}

export async function create(entity: Test): Promise<Test> {
    const response = await dbTest.post(entity);
    if (response.ok) {
        return { ...entity, _id: response.id, _rev: response.rev };
    } else {
        throw new Error();
    }
}

