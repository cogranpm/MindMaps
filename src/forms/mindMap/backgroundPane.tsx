import React, { useContext } from 'react';
import { RECT_CORNER_RADIUS, SCENE_HEIGHT, SCENE_WIDTH, ShapeType, TRUNK_WIDTH, XOrientation } from '../../shared/constants';
import { addBranch } from '../models/mindMaps/modelHandlers';
import { AppContext } from '../models/mindMaps/context';
import { getMindMapFromCache } from '../models/mindMaps/factories';
import { MindMap } from '../models/mindMaps/state';
import { calculatePaneWidth, calculateRightPaneX } from '../models/mindMaps/ui_calculations';

type BackgroundProps = {
    orientation: XOrientation;
}

export const BackgroundPane = (props: BackgroundProps) => {

    const { state, dispatch } = useContext(AppContext);
    const mindMap = getMindMapFromCache(state) as MindMap;

    const onClickPane = async (event: any) => {
        addBranch(mindMap, props.orientation, dispatch);
    }

    return (
        <rect
            x={props.orientation === XOrientation.Left ? 0 : calculateRightPaneX(SCENE_WIDTH, TRUNK_WIDTH)}
            y={0}
            data-shape-type={props.orientation === XOrientation.Left ? ShapeType.LeftPanel : ShapeType.RightPanel}
            width={calculatePaneWidth(SCENE_WIDTH, TRUNK_WIDTH)}
            height={mindMap ? mindMap.height : SCENE_HEIGHT}
            rx={RECT_CORNER_RADIUS}
            onClick={onClickPane}
        />
    );
}
