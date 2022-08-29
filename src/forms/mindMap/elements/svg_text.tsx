import React, { useContext } from 'react';

type TextProps = {
    x: number,
    y: number,
    width: number,
    height: number,
    text: string
}

export const SvgText = (props: TextProps) => {
    return (
        <text x={props.x} y={props.y} width={props.width} height={props.height}> {props.text}</ text>
    );
}

