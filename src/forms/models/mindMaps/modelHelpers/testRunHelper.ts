import { get, put } from "~src/shared/databaseAdapter";
import { dbBlob } from "~src/shared/localData";
import { LoadAnswersMessage, LoadTestRunsMessage, LoadTestRunsResponse, LocalDatabase, PersistTestRunMessage } from "~src/shared/workerMessages";
import { makeTestRunAnswer } from "../factories";
import { AnswerViewModel, LongTextType, Question, Test, TestRunAnswer } from "../state";
import { loadTestAudio, loadTestRunAudio, persistTestRunAudio } from "./blobHelpers";
import { processLongText } from "./longTextHelper";

export const loadTestRuns = async (message: LoadTestRunsMessage) => {
    const leaf = message.leaf;
    const test = await get(LocalDatabase.Test, leaf.id) as Test;
    const body = await processLongText(leaf, LongTextType.Body);
    const audioQueueItems = await loadTestAudio(test, dbBlob);
    return {
        test: test,
        body: body,
        audioQueueItems: audioQueueItems
    } as LoadTestRunsResponse;
};

const shuffleQuestions = (questions: Question[]): Question[] => {
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    return questions;
};

export const loadAnswers = async (message: LoadAnswersMessage) => {
    const viewModel = await Promise.all(
        //val shuffledList = shuffleArray(message.test.questions);
        shuffleQuestions(message.test.questions).map(async (question) => {
            let theAnswer = message.testRun.answers.find(
                (answer: TestRunAnswer) => answer.questionId === question.id
            );
            let audioBlob: Blob | undefined = undefined;
            if (!theAnswer) {
                theAnswer = makeTestRunAnswer(message.testRun, question);
            } else {
                audioBlob = await loadTestRunAudio(theAnswer.id);
            }
            return {
                audioBlob: audioBlob,
                answer: theAnswer,
                audioBlobDirty: false,
                question: question,
            } as AnswerViewModel;
        })
    );
    return viewModel;
};

export const persistTestRun = async (message: PersistTestRunMessage): Promise<Test> => {
    await persistTestRunAudio(message.answers);
    let existing: Test | undefined = undefined;
    existing = await get(LocalDatabase.Test, message.test._id) as Test;
    const response = await put(LocalDatabase.Test, message.test);

    if (!existing) {
        if (response) {
            if (response.ok) {
                return { ...message.test, _id: response.id, _rev: response.rev };
            } else {
                throw new Error();
            }
        } else {
            return message.test;
        }
    } else {
        return message.test;
    }
};
