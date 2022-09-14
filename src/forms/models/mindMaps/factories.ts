import { LEAF_LIMIT, NULL_TITLE, SCENE_HEIGHT, XOrientation } from "../../../shared/constants";
import { uniqueId } from "../../../shared/uuid";
import { Leaf, LongText, MindMap, Branch, MindMapViewModel, AppState, LeafType, LongTextType, Test, TestRun, Question, TestRunAnswer, Mark } from "./state";

export function makeTest(leaf: Leaf): Test {
    return { _id: leaf.id, _rev: undefined, createDate: Date.now(), questions: new Array<Question>(), testRuns: new Array<TestRun>() };
}

export function makeTestRun(test: Test): TestRun {
    const testRun = { id: uniqueId(), testId: test._id, runDate: Date.now(), answers: new Array<TestRunAnswer>() };
    return testRun;
}

export function makeTestRunAnswer(testRun: TestRun, question: Question): TestRunAnswer {
    return { id: uniqueId(), testRunId: testRun.id, questionId: question.id, createDate: Date.now(), mark: Mark.Unmarked };
}

export function makeQuestion(test: Test): Question {
    return { id: uniqueId(), testId: test._id, title: "", createDate: Date.now() };
}


export function makeLongText(ownerId: string, type: LongTextType): LongText {
    return { _id: uniqueId(), _rev: undefined, ownerId: ownerId, body: "", type: type };
}

export function makeLeaf(branch: Branch, defaultLeafType: LeafType = LeafType.Note): Leaf {
    const leafId = uniqueId();
    return { id: leafId, title: NULL_TITLE, index: branch.leaves.length, type: defaultLeafType, branchId: branch.id }
}

export function makeBranch(mindMap: MindMap, orientation: XOrientation): Branch {
    //keep mindMap in here in case of relational back end
    return {
        id: uniqueId(),
        title: NULL_TITLE,
        orientation: orientation,
        index: mindMap.branches.length,
        leaves: [],
        mindMapId: mindMap._id,
        y: 0
    };
}

export function makeMindMap(leafId?: string): MindMap {
    return { name: NULL_TITLE, _id: uniqueId(), _rev: undefined, branches: [], height: SCENE_HEIGHT, leafId: leafId, defaultLeafType: LeafType.Note} as MindMap;
}

export function makeMindMapWithLeaf(leaf: Leaf): MindMap {
    //return { name: NULL_TITLE, _id: uniqueId(), _rev: undefined, branches: [], height: SCENE_HEIGHT, leafId: leaf.id } as MindMap;
    return makeMindMap(leaf.id);
}

export function getMindMapFromCache(state: AppState): MindMap | undefined {
    const activeTab = state.tabs.find((tab) => tab.mindMap._id === state.activeTabId);
    if (activeTab !== undefined) {
        return activeTab.mindMap;
    } else {
        return undefined;
    }
}



export function updateBranch(mindMap: MindMap, selectedBranch: Branch): MindMap {
    // make a copy of edited branch in the mind map
    // assuming nothing below branch has changed as this is a shallow copy
    const updatedBranches = mindMap.branches.map((branch: Branch) => {
        if (branch.id === selectedBranch.id) {
            //return the branch that has the update
            return { ...selectedBranch };
        } else {
            return branch;
        }
    });
    return { ...mindMap, branches: updatedBranches };
}

export function updateLeaf(mindMap: MindMap, selectedBranch: Branch, selectedLeaf: Leaf): MindMap {
    const updatedBranches = mindMap.branches.map((branch: Branch) => {
        if (branch.id === selectedBranch.id) {
            const updatedLeaves = branch.leaves.map((leaf: Leaf) => {
                if (leaf.id === selectedLeaf.id) {
                    return { ...selectedLeaf };
                } else {
                    return leaf;
                }
            });
            const updatedBranch = { ...branch, leaves: updatedLeaves };
            return updatedBranch;
        } else {
            return branch;
        }
    });
    return { ...mindMap, branches: updatedBranches };
}

export function findBranch(mindMap: MindMap, branchId: string): Branch | undefined {
    return mindMap.branches.find((branch: Branch) => branch.id === branchId);
}
