import { ShapeType, XOrientation } from "../../../shared/constants";
import { AppActions } from "./actions";
import { findBranchInMap, findLeafInMap } from "./modelFinders";
import { addBranchToMindMap, addLeafToBranch, cloneBranch, cloneLeaf, removeBranch, removeLeaf } from "./modelHandlers";
import { MindMap } from "./state";

export const onCut = async (dispatch: React.Dispatch<AppActions>, element: Element | undefined, map: MindMap) => {
    if (element) {
        const shapeType = getShapeType(element);
        switch (shapeType) {
            case ShapeType.Branch: {
                const branch = findBranchInMap(map, element.id);
                if (branch) {
                    const cbWrapper = { type: "branch", data: branch };
                    await copy(cbWrapper);
                    removeBranch(dispatch, map, branch);
                }
                break;
            }
            case ShapeType.Leaf: {
                const branchId = element.getAttribute("data-branch-id");
                if (branchId) {
                    const branch = findBranchInMap(map, branchId);
                    if (branch) {
                        const leaf = findLeafInMap(map, branchId, element.id);
                        if (leaf) {
                            const cbWrapper = { type: "leaf", data: leaf };
                            await copy(cbWrapper);
                            removeLeaf(dispatch, map, leaf);
                        }
                    }
                }
                break;
            }
            case ShapeType.LeafTitle: {
                break;
            }
            default:
                break;
        }
    }
};

export const copy = async (data: any) => {
    await navigator.clipboard.writeText(JSON.stringify(data));
};

export const onCopy = async (dispatch: React.Dispatch<AppActions>, element: Element | undefined, map: MindMap) => {
    if (element) {
        const shapeType = getShapeType(element);
        switch (shapeType) {
            case ShapeType.Branch: {
                const branch = findBranchInMap(map, element.id);
                if (branch) {
                    const cbWrapper = { type: "branch", data: cloneBranch(branch) };
                    copy(cbWrapper);
                }
                break;
            }
            case ShapeType.Leaf: {
                const branchId = element.getAttribute("data-branch-id");
                if (branchId) {
                    const leaf = findLeafInMap(map, branchId, element.id);
                    if (leaf) {
                        const cbWrapper = { type: "leaf", data: cloneLeaf(leaf) };
                        await copy(cbWrapper);
                    }
                }
                break;
            }
            case ShapeType.LeafTitle: {
                break;
            }
            default:
                break;
        }
    }
};

export const onPaste = async (dispatch: React.Dispatch<AppActions>, element: Element | undefined, map: MindMap) => {
    if (element) {
        const item = await navigator.clipboard.readText();
        if (item) {
            try {
                const parsedItem = JSON.parse(item);
                const shapeType = getShapeType(element);
                switch (shapeType) {
                    case ShapeType.Branch: {
                        if (
                            parsedItem.hasOwnProperty("type") &&
                            parsedItem.hasOwnProperty("data")
                        ) {
                            if (parsedItem.type === "leaf") {
                                const branch = findBranchInMap(map, element.id);
                                if (branch) {
                                    const leaf = parsedItem.data;
                                    await addLeafToBranch(
                                        dispatch,
                                        map,
                                        branch,
                                        leaf
                                    );
                                }
                            }
                        }
                        break;
                    }
                    case ShapeType.Leaf: {
                        break;
                    }
                    case ShapeType.LeafTitle: {
                        break;
                    }
                    case ShapeType.LeftPanel: {
                        if (
                            parsedItem.hasOwnProperty("type") &&
                            parsedItem.hasOwnProperty("data")
                        ) {
                            if (parsedItem.type === "branch") {
                                const branch = parsedItem.data;
                                addBranchToMindMap(
                                    map,
                                    branch,
                                    XOrientation.Left,
                                    dispatch
                                );
                            }
                        }
                        break;
                    }
                    case ShapeType.RightPanel: {
                        if (
                            parsedItem.hasOwnProperty("type") &&
                            parsedItem.hasOwnProperty("data")
                        ) {
                            if (parsedItem.type === "branch") {
                                const branch = parsedItem.data;
                                addBranchToMindMap(
                                    map,
                                    branch,
                                    XOrientation.Right,
                                    dispatch
                                );
                            }
                        }
                        break;
                    }
                    default:
                        break;
                }
                //console.log(`ParsedElement: ${JSON.stringify(parsedItem)}`);
            } catch (err) {
                console.log("could not parse clipbard contents");
            }
        }
    }
};

export const onDelete = async (dispatch: React.Dispatch<AppActions>, element: Element | undefined, map: MindMap) => {
    const shapeType = getShapeType(element);
    if (element) {
        switch (shapeType) {
            case ShapeType.Branch: {
                const branch = findBranchInMap(map, element.id);
                if (branch) {
                    removeBranch(dispatch, map, branch);
                }
                break;
            }
            case ShapeType.Leaf: {
                const branchId = element.getAttribute("data-branch-id");
                if (branchId) {
                    const leaf = findLeafInMap(map, branchId, element.id);
                    const branch = findBranchInMap(map, branchId);
                    if (leaf && branch) {
                        removeLeaf(dispatch, map, leaf);
                    }
                }
                break;
            }
            case ShapeType.LeafTitle: {
                break;
            }
            default:
                break;
        }
    }
};

export const getShapeType = (element: Element | undefined): ShapeType => {
    if (element) {
        const shapeTypeAttribute = element.getAttribute("data-shape-type");
        return shapeTypeAttribute != null
            ? parseInt(shapeTypeAttribute, 10)
            : ShapeType.Unknown;
    } else {
        return ShapeType.Unknown;
    }
};

export const isPutClipboardShape = (element: Element | undefined) => {
    const shapeType = getShapeType(element);
    return shapeType === ShapeType.Branch || shapeType === ShapeType.Leaf;
};

export const isPasteShape = (element: Element | undefined) => {
    const shapeType = getShapeType(element);
    return (
        shapeType === ShapeType.Branch ||
        shapeType === ShapeType.LeftPanel ||
        shapeType === ShapeType.RightPanel
    );
};

export const isDeleteShape = (element: Element | undefined) => {
    const shapeType = getShapeType(element);
    return shapeType === ShapeType.Branch || shapeType === ShapeType.Leaf;
};

export const isContextMenuItem = (element: Element | undefined) => {
    return isPutClipboardShape(element) || isPasteShape(element) || isDeleteShape(element);
};
