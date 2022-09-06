/*************************
single button, either Create or Open
*************************/

import React, { Dispatch, useContext } from "react";
import { Leaf, MindMap, TabItem } from "../../models/mindMaps/state";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { ActionType } from "../../models/mindMaps/actions";
import { AppContext } from "../../models/mindMaps/context";
import { Content } from "~src/shared/workerMessages";
import { persist } from "~src/shared/workerClient";
import { FETCH_ID_PUTMINDMAP } from "~src/shared/constants";

interface LinkEditorProps {
    leaf: Leaf;
    childMindMap: MindMap | undefined;
    setChildMindMap: Dispatch<MindMap | undefined>;
    addingChildMap: boolean;
    saveHandler: () => void;
}

export const MindMapEditor = (props: LinkEditorProps) => {
    const { state, dispatch } = useContext(AppContext);

    const handleClick = async (e: any) => {
        /* if childMindMap does not exist, then persist it now */
        if (props.childMindMap) {
            let mindMapToOpen = props.childMindMap as MindMap;
            if (props.addingChildMap) {
                /*
                mindMapToOpen = await create(props.childMindMap);
                dispatch({
                  type: ActionType.Add,
                  payload: { newMindMap: mindMapToOpen as MindMap },
                });
                */
                persist(FETCH_ID_PUTMINDMAP, props.childMindMap, createMindMapCallback);
            }
            props.saveHandler();
            dispatch({
                type: ActionType.OpenTab,
                payload: { entity: mindMapToOpen },
            });
        }
    };

    const createMindMapCallback = (e: Content) => {
        const entity = e as MindMap;
        dispatch({
            type: ActionType.Add,
            payload: { newMindMap: entity as MindMap },
        });
        props.saveHandler();
        dispatch({ type: ActionType.OpenTab, payload: { entity: entity } });
    };

    return (
        <Form.Group as={Row} className="mb-8" controlId="link">
            <Form.Label column sm={2}>
                Mind Map
            </Form.Label>
            <Col>
                <Form.Control
                    required
                    type="button"
                    name="mindMap"
                    size="sm"
                    value={props.childMindMap ? props.childMindMap.name : "untitled"}
                    onClick={handleClick}
                ></Form.Control>
            </Col>
        </Form.Group>
    );
};
