import React, { useContext } from "react";
import { AppContext } from "../models/mindMaps/context";
import { Branch, MindMap } from "../models/mindMaps/state";
import EdiText from "react-editext";
import { Row, Col, Container, Button } from "react-bootstrap";
import { logMessage, logSystemError } from "../../shared/errorHandling";
import { BUTTON_VARIANT, DELETE_KEY, Direction, ENTER_KEY, ShapeType, XOrientation } from "../../shared/constants";
import { getMindMapFromCache, makeLeaf } from "../models/mindMaps/factories";
import { background, border, boxShadow, font, padding } from "./domStyles";
import { ActionType } from "../models/mindMaps/actions";
import { ArrowBarDown, ArrowBarUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Plus } from "react-bootstrap-icons";
import {
    copyBranch,
    moveBranch,
    removeBranch,
    addLeafToBranch,
} from "../models/mindMaps/modelHandlers";
import { TitleEditor } from "./elements/titleEditor";

export interface BranchDomProps {
    branch: Branch;
    handleSave: () => void;
}

export const BranchDom = (props: BranchDomProps) => {

    const { state, dispatch } = useContext(AppContext);
    const mindMap = getMindMapFromCache(state) as MindMap;

    const onBranchKeyPress = async (e: React.KeyboardEvent, branch: Branch) => {
        e.stopPropagation();
        if (e.key === DELETE_KEY) {
            try {
                removeBranch(dispatch, mindMap, branch);
            } catch (err) {
                logSystemError(err, `error deleting branch ${branch.id}`);
            }
        } else if (e.key === ENTER_KEY) {
            try {
                await addLeaf(branch);
            } catch (err) {
                logSystemError(err, `error adding leaf to branch ${branch.id}`);
            }
        }
    };

    const addLeaf = async (branch: Branch) => {
        try {
            const leaf = makeLeaf(branch, mindMap.defaultLeafType);
            await addLeafToBranch(dispatch, mindMap, branch, leaf);
        } catch (err) {
            logSystemError(err, `error adding leaf to branch ${branch.id}`);
        }
    };



    const onTitleKeyPress = async (e: React.KeyboardEvent, branch: Branch) => {
        if (e.key === ENTER_KEY) {
            dispatch({
                type: ActionType.ShowTitleEditor,
                payload: { entity: branch },
            });
        }
        e.stopPropagation();
    };

    const handleTitleClose = async () => {
        props.handleSave();
    }

    const handleTitleSave = async (e: string) => {
        props.branch.title = e;
    }


    return (

        <div
            id={props.branch.id}
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent) => onBranchKeyPress(e, props.branch)}
            data-shape-type={ShapeType.Branch}
            style={{
                ...{ display: "grid", gridTemplateColumns: "max-content auto" },
                ...border,
                ...background,
                ...padding,
                ...font,
                ...boxShadow
            }}>
            {
                /*
                 <div
                        style={{ padding: "4px", alignSelf: "center" }}
                        data-shape-type={ShapeType.BranchTitle}
                        tabIndex={0}
                        onKeyDown={(e: React.KeyboardEvent) => onTitleKeyPress(e, props.branch)}
                    >
    
                */
            }
            <TitleEditor title={props.branch.title} handleSave={handleTitleSave} shapeType={ShapeType.BranchTitle} />
            <div style={{ justifySelf: "end" }}>
                <Button
                    title="Add Leaf"
                    onClick={() => addLeaf(props.branch)}
                    tabIndex={-1}
                    size="sm"
                    variant={BUTTON_VARIANT}
                >
                    <Plus size={16} aria-label="Add Leaf" />
                </Button>

                <Button
                    title="Duplicate"
                    onClick={() =>
                        copyBranch(dispatch, mindMap, props.branch, Direction.Down)
                    }
                    tabIndex={-1}
                    size="sm"
                    variant={BUTTON_VARIANT}
                >
                    <ArrowBarDown size={16} arial-label="Duplicate" />
                </Button>
                <Button
                    title="Duplicate"
                    onClick={() => copyBranch(dispatch, mindMap, props.branch, Direction.Up)}
                    tabIndex={-1}
                    size="sm"
                    variant={BUTTON_VARIANT}
                >
                    <ArrowBarUp size={16} aria-label="Duplicate" />
                </Button>
                <Button
                    title="move down"
                    onClick={() =>
                        moveBranch(dispatch, mindMap, props.branch, Direction.Down)
                    }
                    tabIndex={-1}
                    size="sm"
                    variant={BUTTON_VARIANT}
                >
                    <ArrowDown size={16} arial-label="Move Down" />
                </Button>
                <Button
                    title="move up"
                    onClick={() => moveBranch(dispatch, mindMap, props.branch, Direction.Up)}
                    tabIndex={-1}
                    size="sm"
                    variant={BUTTON_VARIANT}
                >
                    <ArrowUp size={16} aria-label="Move Up" />
                </Button>
                {props.branch.orientation === XOrientation.Left ? (
                    <Button
                        title="move right"
                        onClick={() =>
                            moveBranch(dispatch, mindMap, props.branch, Direction.Right)
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
                            moveBranch(dispatch, mindMap, props.branch, Direction.Left)
                        }
                        tabIndex={-1}
                        size="sm"
                        variant={BUTTON_VARIANT}
                    >
                        <ArrowLeft size={16} aria-label="Move Left" />
                    </Button>
                )}
            </div>
        </div>
    );
}
