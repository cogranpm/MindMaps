/**********************
 * this module has state: dispatch
 * should turn it into a class or object
 * so the dispatch can be set once
 * why does it have state, because React dispatch is something
 * that can only be retrieved in a react component
 * and this is a helper module
 */

import React, { Dispatch } from "react";
import { ActionType, AppActions } from "./actions";
import { makeBranch } from "./factories";
import { persist } from "../../../shared/workerClient";
import { Branch, Leaf, MindMap } from "./state";
import { Direction, FETCH_ID_ADDBRANCH, FETCH_ID_ADDLEAF, FETCH_ID_COPYBRANCH, FETCH_ID_MOVEBRANCH, FETCH_ID_REMOVEBRANCH, FETCH_ID_REMOVELEAF, LEAF_LIMIT, XOrientation } from "../../../shared/constants";
import { uniqueId } from "../../../shared/uuid";
import { logSystemError } from "../../../shared/errorHandling";
import { confirmDelete } from "../../../shared/windowFunctions";
import { Content } from "~src/shared/workerMessages";

export const addBranch = async (map: MindMap, orientation: XOrientation, dispatch: React.Dispatch<AppActions>) => {
    addBranchToMindMap(map, makeBranch(map, orientation), orientation, dispatch);
};

let dispatch: Dispatch<AppActions>;

export const addBranchToMindMap = async (
    map: MindMap,
    branch: Branch,
    orientation: XOrientation,
    theDispatch: React.Dispatch<AppActions>
) => {
    dispatch = theDispatch;
    const branches = [...map.branches, branch];
    map.branches = branches;
    //const updatedMindMap = await persist(map);
    dispatch({
        type: ActionType.FocusElement,
        payload: { id: branch.id }
    });
    persist(FETCH_ID_ADDBRANCH, map, persistCallback);
};

const persistCallback = (e: Content) => {
    const updatedMindMap = e as MindMap;
    if (dispatch) {
        dispatch({ type: ActionType.EditMindMap, payload: { updatedEntity: updatedMindMap } });
    }
}


export const sortBranches = (branches: Branch[]) => {
    return branches.sort(sortBranch);
};

function sortBranch(a: Branch, b: Branch) {
    if (a.index < b.index) {
        return -1;
    }
    if (a.index > b.index) {
        return 1;
    }
    return 0;
}

export const cloneBranch = (branch: Branch) => {
    /*
    const leaves = branch.leaves.map((theLeaf) => {
        return cloneLeaf(theLeaf);
    });
    */
    const newBranch = { ...branch };
    newBranch.id = uniqueId();
    //newBranch.leaves = leaves;
    return newBranch;
};

export const cloneLeaf = (leaf: Leaf) => {
    const newLeaf = { ...leaf };
    newLeaf.id = uniqueId();
    return newLeaf;
};

export const reorder = (map: MindMap) => {
    //just go down the branches for each side
    // set the index to the position of the branch
    const leftBranches = map.branches.filter((theBranch) =>
        theBranch.orientation === XOrientation.Left);

    const rightBranches = map.branches.filter((theBranch) =>
        theBranch.orientation === XOrientation.Right);

    let runningIndex = 0;
    setBranchOrder(runningIndex, leftBranches);
    runningIndex = 0;
    setBranchOrder(runningIndex, rightBranches);

    function setBranchOrder(runningIndex: number, branches: Branch[]) {
        branches.forEach((theBranch) => {
            runningIndex++;
            theBranch.index = runningIndex;
        });
    }
};

export const isDirectionVertical = (direction: Direction) => {
    return (direction === Direction.Up || direction === Direction.Down) ? true : false;
};


export const moveBranch = async (theDispatch: Dispatch<AppActions>, mindMap: MindMap, branch: Branch, direction: Direction) => {
    try {
        dispatch = theDispatch;
        reorder(mindMap); //makes sure no two branches have the same index
        const existingBranch = mindMap.branches.find((theBranch) => theBranch.id === branch.id);
        if (existingBranch) {
            if (isDirectionVertical(direction)) {
                let nextBranch = null;
                if (direction === Direction.Up) {
                    const lessThan = (a: Branch, b: Branch) => a.index <= b.index;
                    const candidates = mindMap.branches.filter((theBranch) =>
                        lessThan(theBranch, existingBranch)
                        && theBranch.orientation === existingBranch.orientation
                        && theBranch.id !== existingBranch.id
                    );
                    if (candidates && candidates.length > 0) {
                        sortBranches(candidates);
                        nextBranch = candidates[candidates.length - 1];
                    }
                } else if (direction === Direction.Down) {
                    const comparator = (a: Branch, b: Branch) => a.index >= b.index;
                    nextBranch = mindMap.branches.find((theBranch) =>
                        comparator(theBranch, existingBranch)
                        && theBranch.orientation === existingBranch.orientation
                        && theBranch.id !== existingBranch.id);
                }
                if (nextBranch) {
                    //swap the indexes of the two branches
                    const existingIndex = existingBranch.index;
                    const nextIndex = nextBranch.index;
                    nextBranch.index = existingIndex;
                    existingBranch.index = nextIndex;
                }

            } else {
                let nextBranch = null;
                if (direction === Direction.Right) {
                    //is there any existing branch with same index
                    nextBranch = mindMap.branches.find((theBranch) =>
                        theBranch.index === existingBranch.index
                        && theBranch.orientation === XOrientation.Right
                        && theBranch.id !== existingBranch.id);
                    existingBranch.orientation = XOrientation.Right;
                } else if (direction === Direction.Left) {
                    nextBranch = mindMap.branches.find((theBranch) =>
                        theBranch.index === existingBranch.index
                        && theBranch.orientation === XOrientation.Left
                        && theBranch.id !== existingBranch.id);
                    existingBranch.orientation = XOrientation.Left;
                }
                if (nextBranch) {
                    //console.log(`Next branch: ${nextBranch.title}:${nextBranch.index}`);
                    reshuffleIndexes(mindMap, existingBranch);
                }
            }
            sortBranches(mindMap.branches);
            //const updatedMindMap = await persist(mindMap);
            //dispatch({ type: ActionType.HideTitleEditor, payload: { updatedEntity: updatedMindMap } });
            persist(FETCH_ID_MOVEBRANCH, mindMap, persistCallback);

        }
    } catch (err) {
        logSystemError(err, "Error moving branch");
    }
};

export const copyBranch = async (theDispatch: Dispatch<AppActions>, mindMap: MindMap, branch: Branch, direction: Direction) => {
    try {
        dispatch = theDispatch;
        reorder(mindMap); //makes sure no two branches have the same index
        // add a new branch
        const existingBranch = mindMap.branches.find((theBranch) => theBranch.id === branch.id);
        if (existingBranch) {
            const newBranch = cloneBranch(existingBranch);
            if (direction === Direction.Up) {
                newBranch.index = existingBranch.index - 1;
            } else {
                newBranch.index = existingBranch.index + 1;
            }

            const updatedBranches = [...mindMap.branches, newBranch];
            let updatedMindMap = { ...mindMap, branches: updatedBranches };
            reshuffleIndexes(mindMap, newBranch);
            sortBranches(mindMap.branches);
            //updatedMindMap = await persist(updatedMindMap);
            //dispatch({ type: ActionType.HideTitleEditor, payload: { updatedEntity: updatedMindMap } });
            persist(FETCH_ID_COPYBRANCH, updatedMindMap, persistCallback);
        }
    } catch (err) {
        logSystemError(err, "Error copying branch");
    }
};

export const removeBranch = async (theDispatch: React.Dispatch<AppActions>, mindMap: MindMap, branch: Branch) => {
    dispatch = theDispatch;
    if (confirmDelete(branch.title)) {
        const updatedBranches = mindMap.branches.filter(
            (b) => b.id !== branch.id
        );
        let updatedMindMap = { ...mindMap, branches: updatedBranches };
        persist(FETCH_ID_REMOVEBRANCH, updatedMindMap, persistCallback);
        /*
        updatedMindMap = await persist(updatedMindMap);
        dispatch({
            type: ActionType.EditMindMap,
            payload: { updatedEntity: updatedMindMap },
        });
        */

    }
};

export const addLeafToBranch = async (
    theDispatch: React.Dispatch<AppActions>,
    mindMap: MindMap,
    selectedBranch: Branch,
    leaf: Leaf) => {
    dispatch = theDispatch;
    const updatedBranches = mindMap.branches.map((branch: Branch) => {
        if (branch.id === selectedBranch.id) {
       //     if (selectedBranch.leaves.length < LEAF_LIMIT) {
                const leaves = [...branch.leaves, leaf];
                const updatedBranch = { ...branch, leaves: leaves };
                return updatedBranch;
        //    } else {
        //        return branch;
        //    }
        } else {
            return branch;
        }
    });
    let updatedMindMap = { ...mindMap, branches: updatedBranches };
    dispatch({ type: ActionType.FocusElement, payload: { id: leaf.id } });
    persist(FETCH_ID_ADDLEAF, updatedMindMap, persistCallback);
    /*
    updatedMindMap = await persist(updatedMindMap);
    dispatch({
        type: ActionType.EditMindMap,
        payload: { updatedEntity: updatedMindMap },
    });
    */
}

export const removeLeaf = async (theDispatch: React.Dispatch<AppActions>, mindMap: MindMap, leaf: Leaf) => {
    dispatch = theDispatch;
    if (!confirmDelete(leaf.title)) {
        return;
    }
    const branch = mindMap.branches.find((b) => b.id === leaf.branchId);
    if (branch) {
        const updatedleaves = branch.leaves.filter((l) => l.id !== leaf.id);
        const updatedBranch = { ...branch, leaves: updatedleaves };
        const updatedBranches = mindMap.branches.map((b) => {
            if (b.id === updatedBranch.id) {
                return updatedBranch;
            } else {
                return b;
            }
        });
        let updatedMindMap = { ...mindMap, branches: updatedBranches };
        persist(FETCH_ID_REMOVELEAF, updatedMindMap, persistCallback);
        /*
        updatedMindMap = await persist(updatedMindMap);
        dispatch({
            type: ActionType.EditMindMap,
            payload: { updatedEntity: updatedMindMap },
        });
        */
    }
};

const printIndexes = (map: MindMap, alteredBranch: Branch) => {
    //debug, show all indexes
    map.branches.filter((theBranch) => theBranch.orientation === alteredBranch.orientation).forEach((theBranch) =>
        console.log(`Index: ${theBranch.title}:${theBranch.index}`));
    console.log(`Index altered branch: ${alteredBranch.title}:${alteredBranch.index}`);
};

const reshuffleIndexes = (map: MindMap, alteredBranch: Branch) => {
    /* trigger a reordering of the branches
       on one side of the trunk or other
       fired by cloning a branch
       the key to this is taking the index of the altered branch
       then getting everything equal to this and above it
       and shuffling all the indexes by 1
    */
    const branches = map.branches.filter((theBranch) =>
        (theBranch.orientation === alteredBranch.orientation) &&
        (theBranch.index >= alteredBranch.index) &&
        (theBranch.id !== alteredBranch.id)
    );

    let startingIndex = alteredBranch.index;
    branches.forEach(
        (theBranch) => {
            theBranch.index = startingIndex + 1;
            startingIndex++;
        }
    );
};
