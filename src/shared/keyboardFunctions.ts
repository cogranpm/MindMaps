import { Branch, Leaf, MindMap } from "../forms/models/mindMaps/state";
import { Direction, ShapeType, XOrientation } from "./constants";

function findFirstBranch(map: MindMap, orientation: XOrientation) {
    return map.branches.find((x) => x.orientation === orientation);
}

function findNextLeaf(leaves: Leaf[], leaf: Leaf) {
    const index = leaves.findIndex((x) => x.id === leaf.id);
    if (index === -1) {
        return undefined;
    }
    if (index < (leaves.length - 1)) {
        return leaves[index + 1];
    } else {
        return leaves[0];
    }
}

function findPreviousLeaf(leaves: Leaf[], leaf: Leaf) {
    const index = leaves.findIndex((x) => x.id === leaf.id);
    if (index === -1) {
        return undefined;
    }
    if (index === 0) {
        return leaves[(leaves.length - 1)];
    } else {
        return leaves[index - 1];
    }
}

function findNextBranch(map: MindMap, branch: Branch) {
    const branches = map.branches.filter((x) => x.orientation === branch.orientation);
    const index = branches.findIndex((x) => x.id === branch.id);
    if (index === -1) {
        return undefined;
    }
    if (index < (branches.length - 1)) {
        return branches[index + 1];
    } else {
        return branches[0];
    }
}

function findPreviousBranch(map: MindMap, branch: Branch) {
    const branches = map.branches.filter((x) => x.orientation === branch.orientation);
    const index = branches.findIndex((x) => x.id === branch.id);
    if (index === -1) {
        return undefined;
    }
    if (index === 0) {
        return branches[(branches.length - 1)];
    } else {
        return branches[index - 1];
    }
}

function focusBranch(branch: Branch | undefined) {
    if (branch !== undefined) {
        const element = document.getElementById(branch.id);
        if (element !== null) {
            //console.log(`Trying to focus: ${branch.id}`);
            //console.log(`Inner HTML: ${element.outerHTML}`);
            element.focus({preventScroll: false});
        }
    }
}

function focusLeaf(targetLeaf: Leaf | undefined) {
    if (targetLeaf !== undefined) {
        const element = document.getElementById(targetLeaf.id);
        if (element !== null) {
            element.focus();
        }
    }
}

function moveTrunk(orientation: XOrientation, map: MindMap) {
    focusBranch(findFirstBranch(map, orientation));
}

function moveBranch(element: Element, direction: Direction, map: MindMap) {
    const branch = map.branches.find((x) => x.id === element.id);
    if (branch !== undefined) {
        if ((direction === Direction.Left && branch.orientation === XOrientation.Left) ||
            (direction === Direction.Right && branch.orientation === XOrientation.Left)) {
            focusBranch(findFirstBranch(map, XOrientation.Right));
        } else if ((direction === Direction.Right && branch.orientation === XOrientation.Right) ||
            (direction === Direction.Left && branch.orientation === XOrientation.Right)) {
            focusBranch(findFirstBranch(map, XOrientation.Left));
        } else if ((direction === Direction.Up)) {
            focusBranch(findPreviousBranch(map, branch));
        } else if ((direction === Direction.Down)) {
            focusBranch(findNextBranch(map, branch));
        }
    }
}

function moveLeaf(element: Element, direction: Direction, map: MindMap) {
    const branchId = element.getAttribute("data-branch-id");
    const branch = map.branches.find((x) => x.id === branchId);
    if (branch !== undefined) {
        const leaf = branch.leaves.find((x) => x.id === element.id);
        if (leaf !== undefined) {
            switch (direction) {
                case Direction.Up: {
                    focusBranch(branch);
                    break;
                }
                case Direction.Down: {
                    focusBranch(findNextBranch(map, branch));
                    break;
                }
                case Direction.Left: {
                    focusLeaf(findPreviousLeaf(branch.leaves, leaf));
                    break;
                }
                case Direction.Right: {
                    focusLeaf(findNextLeaf(branch.leaves, leaf));
                    break;
                }
                default: break;
            }
        }
    }
}

function moveLeafElement(element: Element, direction: Direction, map: MindMap) {
    const leafId = element.getAttribute("data-leaf-id");
    if (leafId) {
        const leafElement = document.getElementById(leafId);
        if (leafElement) {
            const branchId = leafElement.getAttribute("data-branch-id");
            const branch = map.branches.find((x) => x.id === branchId);
            if (branch !== undefined) {
                const leaf = branch.leaves.find((x) => x.id === leafId);
                if (leaf !== undefined) {
                    switch (direction) {
                        case Direction.Up: {
                            focusBranch(branch);
                            break;
                        }
                        case Direction.Down: {
                            focusBranch(findNextBranch(map, branch));
                            break;
                        }
                        case Direction.Left: {
                            focusLeaf(findPreviousLeaf(branch.leaves, leaf));
                            break;
                        }
                        case Direction.Right: {
                            focusLeaf(findNextLeaf(branch.leaves, leaf));
                            break;
                        }
                        default: break;
                    }
                }
            }
        }
    }
}

function moveLeft(element: Element, type: ShapeType, map: MindMap) {
    switch (type) {
        case ShapeType.Trunk: {
            moveTrunk(XOrientation.Left, map);
            break;
        }
        case ShapeType.Branch: {
            moveBranch(element, Direction.Left, map);
            break;
        }
        case ShapeType.Leaf: {
            moveLeaf(element, Direction.Left, map);
            break;
        }
        case ShapeType.LeafTitle: {
            moveLeafElement(element, Direction.Left, map);
            break;
        }
        case ShapeType.LeafExpandButton: {
            moveLeafElement(element, Direction.Left, map);
            break;
        }
        case ShapeType.LeafEditButton: {
            moveLeafElement(element, Direction.Left, map);
            break;
        }
        default: break;
    }
}

function moveRight(element: Element, type: ShapeType, map: MindMap) {
    switch (type) {
        case ShapeType.Trunk: {
            moveTrunk(XOrientation.Right, map);
            break;
        }
        case ShapeType.Branch: {
            moveBranch(element, Direction.Right, map);
            break;
        }
        case ShapeType.Leaf: {
            moveLeaf(element, Direction.Right, map);
            break;
        }
        case ShapeType.LeafTitle: {
            moveLeafElement(element, Direction.Right, map);
            break;
        }
        case ShapeType.LeafExpandButton: {
            moveLeafElement(element, Direction.Right, map);
            break;
        }
        case ShapeType.LeafEditButton: {
            moveLeafElement(element, Direction.Right, map);
            break;
        }
        default: break;
    }

}

function moveUp(element: Element, type: ShapeType, map: MindMap) {
    switch (type) {
        case ShapeType.Branch: {
            moveBranch(element, Direction.Up, map);
            break;
        }
        case ShapeType.Leaf: {
            moveLeaf(element, Direction.Up, map);
            break;
        }
        case ShapeType.LeafTitle: {
            moveLeafElement(element, Direction.Up, map);
            break;
        }
        case ShapeType.LeafExpandButton: {
            moveLeafElement(element, Direction.Up, map);
            break;
        }
        case ShapeType.LeafEditButton: {
            moveLeafElement(element, Direction.Up, map);
            break;
        }
        default: break;
    }
}

function moveDown(element: Element, type: ShapeType, map: MindMap) {
    switch (type) {
        case ShapeType.Branch: {
            moveBranch(element, Direction.Down, map);
            break;
        }
        case ShapeType.Leaf: {
            moveLeaf(element, Direction.Down, map);
            break;
        }
        case ShapeType.LeafTitle: {
            moveLeafElement(element, Direction.Down, map);
            break;
        }
        case ShapeType.LeafExpandButton: {
            moveLeafElement(element, Direction.Down, map);
            break;
        }
        case ShapeType.LeafEditButton: {
            moveLeafElement(element, Direction.Down, map);
            break;
        }
        default: break;
    }
}


export const onKeyPress = (
    event: React.KeyboardEvent,
    map: MindMap,
    addBranch: (map: MindMap, orientation: XOrientation) => void) => {
    const activeElement = document.activeElement;
    if (activeElement != null) {
        const shapeTypeAttribute = activeElement.getAttribute("data-shape-type");
        const shapeType = (shapeTypeAttribute != null) ? parseInt(shapeTypeAttribute, 10) : ShapeType.Unknown;
        switch (event.key) {
            case "h": moveLeft(activeElement, shapeType, map); break;
            case "l": moveRight(activeElement, shapeType, map); break;
            case "j": moveDown(activeElement, shapeType, map); break;
            case "k": moveUp(activeElement, shapeType, map); break;
            default: break;
        }
    }
    switch (event.key) {
        case "a":
            addBranch(map, XOrientation.Left);
            break;
        case "o":
            addBranch(map, XOrientation.Right);
            break;
        default: break;
    }
};
