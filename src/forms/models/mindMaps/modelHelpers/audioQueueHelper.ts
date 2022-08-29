import { InitializeLeafResponse } from "~src/shared/workerMessages";
import { audioQueue, AudioQueueItem } from "../state";

export const processAudioQueueResponse = (audioQueueItems: (AudioQueueItem | undefined)[]) => {
    //either add the audio to the queue if it doesn't exist already
    //or overwrite the audio blobs if it is already in the queue
    audioQueueItems
      .filter((item) => item !== undefined)
      .forEach((item) => {
        if (item !== undefined) {
          const audioQueueItem = item as AudioQueueItem;
          if (!audioQueue.has(audioQueueItem._id)) {
            audioQueue.set(audioQueueItem._id, audioQueueItem);
          } else {
            const existingQueueItem = audioQueue.get(
              audioQueueItem._id
            ) as AudioQueueItem;
            existingQueueItem.answerBlob = audioQueueItem.answerBlob;
            existingQueueItem.questionBlob = audioQueueItem.questionBlob;
          }
        }
      });
  };

