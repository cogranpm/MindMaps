import { AppState } from "./state";

/*
export const calculateHeightFromState = (state: AppState) => {
    return state.mindMap !== undefined ? state.mindMap.height : 0;
}
*/

export const calculatePaneWidth = (sceneWidth: number, trunkWidth: number) => {
    return (sceneWidth / 2) - (trunkWidth / 2);
}

export const calculateRightPaneX = (sceneWidth: number, trunkWidth: number) => {
    return (sceneWidth / 2) + (trunkWidth / 2);
}

export const calculateBranchWidth = (sceneWidth: number, trunkWidth: number) => {
    return (sceneWidth / 2) - (trunkWidth / 2) - 4;
}

export const calculateBranchY = (index: number, branchHeight: number, branchVerticalSpace: number) => {
    return ((branchHeight + branchVerticalSpace) * index)
}

export const calculateBranchX = (sceneWidth: number, trunkWidth: number) => {
    return (sceneWidth / 2) + (trunkWidth / 2);
}
