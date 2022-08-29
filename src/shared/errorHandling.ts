import { LOGGING_ENABLED } from "./constants";

export function logSystemError(error: any, message: string) {
    let reportedMessage = ""
    if (error instanceof Error) {
        reportedMessage = message.concat(` ${error.message}`);
    } else {
        reportedMessage = message;
    }
    console.log(reportedMessage);
}

export const logMessage = (message: string) => {
    if(LOGGING_ENABLED){
        console.log(message);
    }
}

export class SyncError extends Error{
    constructor(errorInfo: string){
        super("Sync Error");
        errorInfo = errorInfo;
    }
}

