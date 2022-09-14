import React, { useContext, useEffect } from "react";
import { AppContext } from "../models/mindMaps/context";
import * as styles from "../forms.module.css";
import {
    BRANCH_HEIGHT,
    DELETE_KEY,
    ENTER_KEY,
    FETCH_ID_GETMINDMAPBYLEAF,
    RECT_CORNER_RADIUS,
    SCENE_WIDTH,
    ShapeType,
    TITLE_HEIGHT,
    TRUNK_WIDTH,
    TITLE_INDENT,
    XOrientation,
    TITLE_TOP_PADDING,
    DROP_SHADOW_FILTER,
    LEAF_LIMIT,
    LEAF_HEIGHT,
    LEAF_STEM_HEIGHT
} from "../../shared/constants";
import { Branch, Leaf, LeafType, MindMap } from "../models/mindMaps/state";
import { calculateBranchX } from "../models/mindMaps/ui_calculations";
import { ActionType } from "../models/mindMaps/actions";
import { PushButton } from "./elements/push_button";
import { Eye, PencilSquare, Link, ClipboardCheck, FolderSymlink } from "react-bootstrap-icons";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { logMessage } from "../../shared/errorHandling";
//import { loadMindmapByLeaf } from "../models/mindMaps/repository";
import { getMindMapFromCache } from "../models/mindMaps/factories";
import { removeLeaf } from "../models/mindMaps/modelHandlers";
import { find } from "~src/shared/workerClient";
import { Content } from "~src/shared/workerMessages";

type LeafProps = {
    branch: Branch;
    branchY: number;
};

const LEAF_WIDTH = 160;
const LEAF_SPACER = 20;
const BUTTON_INSET = 15;

export const TreeLeaf = (props: LeafProps) => {

    /*
      useEffect(() => {
          logMessage("Leaf just rendered.");
      });
    */

    const { state, dispatch } = useContext(AppContext);
    const mindMap = getMindMapFromCache(state) as MindMap;

    const handleLeafClick = (e: any) => { };

    const handleLeafKeyPress = async (e: React.KeyboardEvent, leaf: Leaf) => {
        if (e.key === DELETE_KEY) {
            removeLeaf(dispatch, mindMap, leaf);
        }
    };

    const handleLeafTitleKeyPress = (e: React.KeyboardEvent, leaf: Leaf) => {
        if (e.key === ENTER_KEY) {
            dispatch({ type: ActionType.ShowTitleEditor, payload: { entity: leaf } });
        }
    };

    const handleEditClick = (leaf: Leaf) => {
        dispatch({ type: ActionType.ShowLeafEditor, payload: { leaf: leaf } });
    };

    const handleViewClick = (leaf: Leaf) => {
        dispatch({ type: ActionType.ShowLeafViewer, payload: { leaf: leaf } });
    };

    const handleLink = (leaf: Leaf) => {
        window.open(leaf.url);
    };

    const handleTest = (leaf: Leaf) => {
        dispatch({ type: ActionType.ShowTestRunEditor, payload: { leaf: leaf } });
    };

    const handleMindMap = async (leaf: Leaf) => {
        find(
            FETCH_ID_GETMINDMAPBYLEAF,
            {
                selector: { leafId: leaf.id },
            },
            loadMindMapCallback
        );
    };

    const loadMindMapCallback = (e: Content) => {
        const response = e as PouchDB.Find.FindResponse<Content>;
        if (response) {
            if (response.docs.length > 0) {
                dispatch({
                    type: ActionType.OpenTab,
                    payload: { entity: response.docs[0] as MindMap },
                });
            }
        }
    };

    const startingX: number =
        props.branch.orientation === XOrientation.Left
            ? 0
            : calculateBranchX(SCENE_WIDTH, TRUNK_WIDTH);

    const y = (props.branchY + BRANCH_HEIGHT);///  + LEAF_STEM_HEIGHT;

    const leaves = props.branch.leaves.map((leaf: Leaf, index: number) => {

        let currentRow = 1;
        if (index > 0) {
            let calcIndex = index + 1;
            currentRow = Math.ceil(calcIndex / (5));
            if (currentRow === 0) {
                currentRow = 1;
            }
        }

        let newIndex = index;
        let lineTop = props.branchY + BRANCH_HEIGHT;

        let currentLevelY = y + LEAF_STEM_HEIGHT;

        if (currentRow !== 1) {
            const totalHeight = LEAF_HEIGHT + LEAF_STEM_HEIGHT;
            const rowHeight = (currentRow - 1) * totalHeight;
            currentLevelY = currentLevelY + rowHeight;

            // go back to beginning of branch for new row
            newIndex = index - ((currentRow - 1) * LEAF_LIMIT);
            lineTop = currentLevelY - LEAF_STEM_HEIGHT;
        }
        const x = startingX + newIndex * (LEAF_WIDTH + LEAF_SPACER);
        //place leaf line to the left a little
        const lineX = x + (LEAF_WIDTH / 6);
        const otherLineX = (x + LEAF_WIDTH) - (LEAF_WIDTH / 6);
        const titleTop = currentLevelY + 20;
        const titleLeft = x + TITLE_INDENT;
        const titleWidth = LEAF_WIDTH;
        const buttonBarY = currentLevelY + LEAF_HEIGHT - 40;

        return (
            <g key={leaf.id}>
                <line x1={lineX} y1={lineTop} x2={lineX} y2={lineTop + LEAF_STEM_HEIGHT} stroke={"black"} strokeWidth="1" />
                <line x1={otherLineX} y1={lineTop} x2={otherLineX} y2={lineTop + LEAF_STEM_HEIGHT} stroke={"black"} strokeWidth="1" />
                <rect
                    id={leaf.id}
                    x={x}
                    y={currentLevelY}
                    rx={RECT_CORNER_RADIUS}
                    height={LEAF_HEIGHT}
                    width={LEAF_WIDTH}
                    tabIndex={0}
                    filter={DROP_SHADOW_FILTER}
                    onClick={(e) => handleLeafClick(e)}
                    onKeyDown={(e: React.KeyboardEvent) => handleLeafKeyPress(e, leaf)}
                    className={styles.leaf}
                    data-shape-type={ShapeType.Leaf}
                    data-branch-id={props.branch.id}
                />
                <text
                    y={titleTop}
                    x={titleLeft}
                    width={titleWidth}
                    height={TITLE_HEIGHT}
                    tabIndex={0}
                    onKeyDown={(e: React.KeyboardEvent) =>
                        handleLeafTitleKeyPress(e, leaf)
                    }
                    data-shape-type={ShapeType.LeafTitle}
                    data-leaf-id={leaf.id}
                    className={styles.smallTitle}
                    fill="#000000"
                >
                    {leaf.title}
                </text>
                <PushButton
                    x={x + BUTTON_INSET}
                    y={buttonBarY}
                    onClick={() => handleViewClick(leaf)}
                >
                    <Eye />
                </PushButton>
                <PushButton
                    x={x + 32 + BUTTON_INSET}
                    y={buttonBarY}
                    onClick={() => handleEditClick(leaf)}
                >
                    <PencilSquare />
                </PushButton>
                {leaf.type === LeafType.Link ? (
                    <PushButton
                        x={x + 32 + 32 + BUTTON_INSET}
                        y={buttonBarY}
                        onClick={() => handleLink(leaf)}
                    >
                        <Link />
                    </PushButton>
                ) : (
                    ""
                )}
                {leaf.type === LeafType.MindMap ? (
                    <PushButton
                        x={x + 32 + 32 + BUTTON_INSET}
                        y={buttonBarY}
                        onClick={() => handleMindMap(leaf)}
                    >
                        <FolderSymlink />
                    </PushButton>
                ) : (
                    ""
                )}
                {leaf.type === LeafType.Test ? (
                    <OverlayTrigger
                        placement="bottom"
                        overlay={<Tooltip id={leaf.id + "_testRuns"}>Test Runs</Tooltip>}
                    >
                        <PushButton
                            x={x + 32 + 32 + BUTTON_INSET}
                            y={buttonBarY}
                            onClick={() => handleTest(leaf)}
                        >
                            <ClipboardCheck />
                        </PushButton>
                    </OverlayTrigger>
                ) : (
                    ""
                )}
            </g>
        );
    });

    return <>{leaves}</>;
};
