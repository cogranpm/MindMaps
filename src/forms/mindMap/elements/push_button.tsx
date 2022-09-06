import React from 'react';
import { Button } from 'react-bootstrap';

export interface PushButtonProps {
    x: number;
    y: number;
    onClick: () => void;
    children?: React.ReactNode;
}

export const PushButton = (props: PushButtonProps) => {
    return (
        <foreignObject x={props.x} y={props.y} width="32" height="32">
            <Button variant="secondary" size="sm" onClick={props.onClick}>
                {props.children}
            </Button>
        </foreignObject>
    )
};
