import { LEAF_LIMIT, LEAF_HEIGHT, LEAF_STEM_HEIGHT } from "~src/shared/constants";
import { AppState, Branch } from "./state";

export const calculatePaneWidth = (sceneWidth: number, trunkWidth: number) => {
    return (sceneWidth / 2) - (trunkWidth / 2);
}

export const calculateRightPaneX = (sceneWidth: number, trunkWidth: number) => {
    return (sceneWidth / 2) + (trunkWidth / 2);
}

export const calculateBranchWidth = (sceneWidth: number, trunkWidth: number) => {
    return (sceneWidth / 2) - (trunkWidth / 2) - 4;
}

export const calculateBranchY = (
    previousBranch: Branch | undefined,
    branchHeight: number,
    branchVerticalSpace: number) => {

    const leafTotalHeight = LEAF_HEIGHT + LEAF_STEM_HEIGHT;
    let leafSpace = 0;
    let y = 0;
    if (previousBranch) {
        y = previousBranch.y;
        const leafRows = Math.ceil(previousBranch.leaves.length / LEAF_LIMIT);
        if (leafRows > 1) {
            leafSpace = leafRows * leafTotalHeight;
        } else {
            leafSpace = leafTotalHeight;
        }
        y = y + branchVerticalSpace + branchHeight ;
    }
    return y + leafSpace;
}

export const calculateBranchX = (sceneWidth: number, trunkWidth: number) => {
    return (sceneWidth / 2) + (trunkWidth / 2);
}
