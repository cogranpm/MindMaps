import React from 'react';
import { Dimension } from '../models/mindMaps/dimension';


type ToolbarProps = {
  dimension: Dimension
}


export const LeafToolbar = (props: ToolbarProps) => {

    return (
        <foreignObject
            x={props.dimension.x}
            y={props.dimension.y}
            width={props.dimension.width}
            height={props.dimension.height}
        >

        </foreignObject>
    );
}
