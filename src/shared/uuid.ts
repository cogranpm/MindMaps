import { v4 as uuidv4 } from 'uuid';

export function uniqueId(): string {
    return uuidv4();
}