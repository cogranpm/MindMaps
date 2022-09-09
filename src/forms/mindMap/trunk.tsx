import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { ArrowBarLeft, ArrowBarRight } from "react-bootstrap-icons"
import {
    RECT_CORNER_RADIUS,
    SCENE_HEIGHT,
    SCENE_WIDTH,
    ShapeType,
    TRUNK_WIDTH,
    XOrientation,
    DROP_SHADOW_FILTER
} from "../../shared/constants";
import { AppContext } from "../models/mindMaps/context";
import { getMindMapFromCache } from "../models/mindMaps/factories";
import * as styles from "../forms.module.css";
import { addBranch } from '../models/mindMaps/modelHandlers';
import { MindMap } from "../models/mindMaps/state";


const x = SCENE_WIDTH / 2 - TRUNK_WIDTH / 2;

export const Trunk = () => {
    const { state, dispatch } = useContext(AppContext);
    const mindMap = getMindMapFromCache(state) as MindMap;

    const onAdd = async (orientation: XOrientation) => {
        addBranch(mindMap, orientation, dispatch);
    }

    return (
        <g width={TRUNK_WIDTH}>
            <rect
                x={x}
                y={0}
                width={TRUNK_WIDTH}
                height={mindMap ? mindMap.height : SCENE_HEIGHT}
                tabIndex={0}
                rx={RECT_CORNER_RADIUS}
                className={styles.trunk}
                data-shape-type={ShapeType.Trunk}
            />
            <text
                x={x + TRUNK_WIDTH / 2}
                y={20}
                className={styles.smallTitle}
                fill="#000000"
                dominantBaseline="middle"
                textAnchor="middle"
            >
                Add Branch
            </text>
            <foreignObject
                id="branchToolbar"
                x={x + 10}
                y={35}
                width={TRUNK_WIDTH}
                height={200}
            >
                <Button
                    title="Add Branch"
                    onClick={() =>
                        onAdd(XOrientation.Left)
                    }
                    tabIndex={-1}
                    size="sm"
                    variant="secondary"
                >
                    <ArrowBarLeft size={16} arial-label="Add Branch" />
                </Button>
                <span style={{ padding: "2px", width: "5px" }} ></span>
                <Button
                    title="Add Branch"
                    onClick={() =>
                        onAdd(XOrientation.Right)
                    }
                    tabIndex={-1}
                    size="sm"
                    variant="secondary"
                >
                    <ArrowBarRight size={16} arial-label="Add Branch" />
                </Button>
            </foreignObject>

        </g>
    );
};
