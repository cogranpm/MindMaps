import React from 'react';
import { RECT_CORNER_RADIUS } from '../../../shared/constants';

type RectProps = {
    x: number,
    y: number,
    width: number,
    height: number,
    fill?: string
}

export const SvgRect = (props: RectProps) => {
    return (
        <rect
            x={props.x}
            y={props.y}
            width={props.width}
            height={props.height}
            rx={RECT_CORNER_RADIUS}
            fill={props.fill ? props.fill : "pink"}
        />
    );
}