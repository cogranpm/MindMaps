import React, { useContext, useEffect } from "react";
import {
    BRANCH_HEIGHT,
    BRANCH_TOOLBAR_BUTTON_COUNT,
    BRANCH_VERTICAL_SPACE,
    DELETE_KEY,
    Direction,
    ENTER_KEY,
    RECT_CORNER_RADIUS,
    SCENE_WIDTH,
    ShapeType,
    TITLE_HEIGHT,
    TITLE_INDENT,
    TITLE_TOP_PADDING,
    TOOLBAR_BUTTON_WIDTH,
    TRUNK_WIDTH,
    XOrientation,
    DROP_SHADOW_FILTER,
    BUTTON_VARIANT
} from "../../shared/constants";
import * as styles from "../forms.module.css";
import { AppContext } from "../models/mindMaps/context";
import { ActionType } from "../models/mindMaps/actions";
import { Branch, MindMap } from "../models/mindMaps/state";
import { TreeLeaf } from "./leaf";
import {
    calculateBranchWidth,
    calculateBranchX,
    calculateBranchY,
} from "../models/mindMaps/ui_calculations";
import { getMindMapFromCache, makeLeaf } from "../models/mindMaps/factories";
import { logMessage, logSystemError } from "../../shared/errorHandling";
import { Button } from "react-bootstrap";
import {
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowBarDown,
    ArrowBarUp,
    Plus
} from "react-bootstrap-icons";
import {
    copyBranch,
    moveBranch,
    removeBranch,
    addLeafToBranch,
} from "../models/mindMaps/modelHandlers";

type BranchProps = {
    children?: React.ReactNode;
};


export const TreeBranch = ({ children }: BranchProps) => {
    const { state, dispatch } = useContext(AppContext);

    const mindMap = getMindMapFromCache(state) as MindMap;

    useEffect(() => {
        logMessage("branch just rendered");
    });

    const makeBranchRect = (branch: Branch, index: number) => {
        const y: number = calculateBranchY(
            index,
            BRANCH_HEIGHT,
            BRANCH_VERTICAL_SPACE
        );
        const x: number =
            branch.orientation === XOrientation.Left
                ? 0
                : calculateBranchX(SCENE_WIDTH, TRUNK_WIDTH);

        const titleTop = y;
        const titleWidth = 360;
        const titleLeft = x + TITLE_INDENT;

        return (
            <g key={branch.id}>
                <rect
                    id={branch.id}
                    x={x}
                    y={y}
                    width={calculateBranchWidth(SCENE_WIDTH, TRUNK_WIDTH)}
                    height={BRANCH_HEIGHT}
                    rx={RECT_CORNER_RADIUS}
                    filter={DROP_SHADOW_FILTER}
                    tabIndex={0}
                    onKeyDown={(e: React.KeyboardEvent) => onBranchKeyPress(e, branch)}
                    className={styles.branch}
                    data-shape-type={ShapeType.Branch}
                />
                <text
                    y={titleTop + TITLE_TOP_PADDING + (BRANCH_HEIGHT / 2)}
                    x={titleLeft}
                    width={titleWidth}
                    height={TITLE_HEIGHT}
                    tabIndex={0}
                    onKeyDown={(e: React.KeyboardEvent) => onTitleKeyPress(e, branch)}
                    data-shape-type={ShapeType.BranchTitle}
                    className={styles.smallTitle}
                    fill="#000000"
                >
                    {branch.title}
                </text>

                <foreignObject
                    id="branchToolbar"
                    x={
                        branch.orientation === XOrientation.Left
                            ? (calculateBranchWidth(SCENE_WIDTH, TRUNK_WIDTH) -
                                (TOOLBAR_BUTTON_WIDTH * BRANCH_TOOLBAR_BUTTON_COUNT) - 10)
                            : (SCENE_WIDTH - (TOOLBAR_BUTTON_WIDTH * BRANCH_TOOLBAR_BUTTON_COUNT) - 10)
                    }
                    y={y + TITLE_TOP_PADDING}
                    width={TOOLBAR_BUTTON_WIDTH * BRANCH_TOOLBAR_BUTTON_COUNT}
                    height={BRANCH_HEIGHT}
                >
                    <Button
                        title="Add Leaf"
                        onClick={() => addLeaf(branch)}
                        tabIndex={-1}
                        size="sm"
                        variant={BUTTON_VARIANT}
                    >
                      <Plus size={16} aria-label="Add Leaf"/>
                    </Button>

                    <Button
                        title="Duplicate"
                        onClick={() =>
                            copyBranch(dispatch, mindMap, branch, Direction.Down)
                        }
                        tabIndex={-1}
                        size="sm"
                        variant={BUTTON_VARIANT}
                    >
                        <ArrowBarDown size={16} arial-label="Duplicate" />
                    </Button>
                    <Button
                        title="Duplicate"
                        onClick={() => copyBranch(dispatch, mindMap, branch, Direction.Up)}
                        tabIndex={-1}
                        size="sm"
                        variant={BUTTON_VARIANT}
                    >
                        <ArrowBarUp size={16} aria-label="Duplicate" />
                    </Button>
                    <Button
                        title="move down"
                        onClick={() =>
                            moveBranch(dispatch, mindMap, branch, Direction.Down)
                        }
                        tabIndex={-1}
                        size="sm"
                        variant={BUTTON_VARIANT}
                    >
                        <ArrowDown size={16} arial-label="Move Down" />
                    </Button>
                    <Button
                        title="move up"
                        onClick={() => moveBranch(dispatch, mindMap, branch, Direction.Up)}
                        tabIndex={-1}
                        size="sm"
                        variant={BUTTON_VARIANT}
                    >
                        <ArrowUp size={16} aria-label="Move Up" />
                    </Button>
                    {branch.orientation === XOrientation.Left ? (
                        <Button
                            title="move right"
                            onClick={() =>
                                moveBranch(dispatch, mindMap, branch, Direction.Right)
                            }
                            tabIndex={-1}
                            size="sm"
                            variant={BUTTON_VARIANT}
                        >
                            <ArrowRight size={16} aria-label="Move Right" />
                        </Button>
                    ) : (
                        <Button
                            title="move left"
                            onClick={() =>
                                moveBranch(dispatch, mindMap, branch, Direction.Left)
                            }
                            tabIndex={-1}
                            size="sm"
                            variant={BUTTON_VARIANT}
                        >
                            <ArrowLeft size={16} aria-label="Move Left" />
                        </Button>
                    )}
                </foreignObject>
                <TreeLeaf branch={branch} branchY={y} />
            </g>
        );
    };


  const addLeaf = async (branch: Branch) => {
    try {
      const leaf = makeLeaf(branch, mindMap.defaultLeafType);
      await addLeafToBranch(dispatch, mindMap, branch, leaf);
    } catch (err) {
      logSystemError(err, `error adding leaf to branch ${branch.id}`);
    }
  };

    const onBranchKeyPress = async (e: React.KeyboardEvent, branch: Branch) => {
        if (e.key === DELETE_KEY) {
            try {
                removeBranch(dispatch, mindMap, branch);
            } catch (err) {
                logSystemError(err, `error deleting branch ${branch.id}`);
            }
        } else if (e.key === ENTER_KEY) {
            try {
                const leaf = makeLeaf(branch, mindMap.defaultLeafType);
                await addLeafToBranch(dispatch, mindMap, branch, leaf);
            } catch (err) {
                logSystemError(err, `error adding leaf to branch ${branch.id}`);
            }
        }
    };

    const onTitleKeyPress = async (e: React.KeyboardEvent, branch: Branch) => {
        if (e.key === ENTER_KEY) {
            dispatch({
                type: ActionType.ShowTitleEditor,
                payload: { entity: branch },
            });
        }
    };

    const branches =
        mindMap !== undefined
            ? mindMap.branches
                .filter((branch: Branch) => branch.orientation === XOrientation.Left)
                .map((branch: Branch, index: number) => {
                    return makeBranchRect(branch, index);
                })
            : "";

    const rightBranches =
        mindMap !== undefined
            ? mindMap.branches
                .filter((branch: Branch) => branch.orientation === XOrientation.Right)
                .map((branch: Branch, index: number) => {
                    return makeBranchRect(branch, index);
                })
            : "";

    return (
        <g>
            {branches}
            {rightBranches}
        </g>
    );
};
