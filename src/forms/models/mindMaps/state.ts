import { XOrientation } from "../../../shared/constants";

export interface AppState {
    activeTabId: string;
    items: MindMapViewModel[];
    tabs: TabItem[];
    showTitleEditor: boolean;
    showLeafEditor: boolean;
    showLeafViewer: boolean;
    showTestRunEditor: boolean;
    activeEntity: Branch | Leaf | null;
    elementToFocus: string;
}

export const initialAppState: AppState = {
    activeTabId: "home",
    items: new Array<MindMapViewModel>(),
    tabs: new Array<TabItem>(),
    showTitleEditor: false,
    showLeafEditor: false,
    showLeafViewer: false,
    showTestRunEditor: false,
    activeEntity: null,
    elementToFocus: ""
};

export const audioQueue = new Map<string, AudioQueueItem>();

export interface TabItem {
    mindMap: MindMap;
}

export interface MindMapViewModel {
    name: string;
    _id: string;
};

export interface LongText {
    _id: string,
    _rev?: string,
    ownerId: string;
    body: string;
    type: LongTextType;
}

export interface Leaf {
    id: string,
    title: string;
    type: LeafType;
    index: number;
    url?: string;
    branchId: string; // in case of relational style back end
    mindMapId?: string;
}

export interface Branch {
    id: string;
    title: string;
    orientation: XOrientation;
    index: number;
    leaves: Leaf[];
    mindMapId: string; // we have this for the relational style back end
    y: number;
}

export interface MindMap {
    name: string;
    _id: string;
    _rev?: string;
    height: number;
    branches: Branch[];
    leafId?: string;
    defaultLeafType?: LeafType;
}

// this is really just a collection of questions hanging off a leaf
// as such, leafId is the primary key
export interface Test {
    _id: string;
    _rev?: string;
    createDate: number;
    questions: Question[];
    testRuns: TestRun[];
}

export interface Question {
    id: string;
    title: string;
    testId: string;
    createDate: number;
}

export interface TestRun {
    id: string;
    testId: string;
    runDate: number;
    answers: TestRunAnswer[];
}

export interface TestRunAnswer {
    id: string;
    testRunId: string;
    questionId: string;
    createDate: number;
    mark: Mark;
}

export type AnswerViewModel = {
    audioBlob: Blob | undefined;
    audioBlobDirty: boolean;
    answer: TestRunAnswer;
    question: Question;
};



//keep a map of these things around to cache the audio blobs
export interface AudioQueueItem {
    _id: string;
    _rev?: string;
    questionDirty: boolean;
    answerDirty: boolean;
    questionBlob?: Blob;
    answerBlob?: Blob;
    runBlob?: Blob;
}


export enum Mark {
    Unmarked,
    Correct,
    Incorrect
}

export enum LeafType {
    Note, //just has the body field
    Test, //a collection of questions and answers, with audio
    Snippet, //a runnable thing I guess
    MindMap, //is a link to another tree, needs a create/open button which opens up a new tab
    Link //is simply a hyperlink when shown in view mode
    //possible others: Audio Note - Task - Appointment - Journal - Time Entry - Login(user name, password, link)
    // Recipes(method in the body and a list of Ingredients (name, quantity, unit of measure, special instructions - ie cut the onions))
    // Contacts (branch is the grouping, leaf is (name, phone, email etc))
    // Server/Physical hardware eg ip address, login, server name, branch would be Dept/Location/Server Farm etc
}

export enum LongTextType {
    Body, //just has the body field
    Snippet
}


export enum BlobType {
    Audio
}

export const LEAF_TYPES: SelectOption[] = [
    { code: LeafType.Note, label: "Note" },
    { code: LeafType.Test, label: "Test" },
    { code: LeafType.Snippet, label: "Snippet" },
    { code: LeafType.MindMap, label: "Mind Map" },
    { code: LeafType.Link, label: "Link" }
];

export interface SelectOption {
    code: number;
    label: string;
}
