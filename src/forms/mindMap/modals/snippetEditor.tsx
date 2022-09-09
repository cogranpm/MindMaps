/***************
 * the data for this is just a string
 * string will be stored in it's own table
 ****************/

import React, { useState } from 'react';
import { Leaf, LongText } from '../../models/mindMaps/state';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { Dispatch } from 'react';
import { AceWrapper } from '../elements/ace_editor';
import { BUTTON_VARIANT } from '~src/shared/constants';


interface SnippetEditorProps {
    leaf: Leaf;
    snippet: LongText | undefined;
    setSnippet: Dispatch<LongText | undefined>;
    submitRef: React.RefObject<HTMLButtonElement>;
}

const logFn = console.log;
let messages: string[] = [];

export const SnippetEditor = (props: SnippetEditorProps) => {

    // should we load the snippet in here unattached to the leaf, or preload and attach to the leaf
    //const [snippet, setSnippet] = useState(() => loadSnippet(props.leaf));
    const [scriptMessages, setScriptMessages] = useState<string[]>([]);

    const handleChangeSnippet = (e: string) => {
        if (props.snippet) {
            props.setSnippet({ ...props.snippet, body: e });
        }
    }

    const save = () => {
        //comes from :w on the editor, not sure what to do here
        if (props.submitRef.current) {
            props.submitRef.current.click();
        }
    };

    const evaluate = (e: any) => {
        if (props.snippet && props.snippet.body.length > 0) {
            messages = ["..."];
            e.preventDefault();
            stealLog();
            const fn = Function(props.snippet.body);
            const evaluated = fn();
            if (evaluated) {
                console.log(evaluated);
            }
            setScriptMessages([...messages]);
            console.log = logFn;
        }
    };

    function stealLog() {
        console.log = (msg) => {
            messages = [...messages, msg];
        };
    }

    return (
        <>
            <Form.Group as={Row} className="mb-3" controlId="snippet">
                <Form.Label column sm={2}>Snippet</Form.Label>
                <Col>
                    <AceWrapper
                        name="body"
                        mode="markdown"
                        showGutter={false}
                        readOnly={false}
                        defaultValue=""
                        height={"280px"}
                        snippet={props.snippet ? props.snippet.body : ""}
                        onChange={handleChangeSnippet}
                        tabIndex={0}
                        focus={false}
                        writeHandler={save}
                    />
                </Col>
            </Form.Group>

            <Row>
                <Col/>
                <Col xs lg="1" className="mb-3">
                    <Button variant={BUTTON_VARIANT} onClick={evaluate}>Evaluate</Button>
                </Col>
            </Row>

            <Form.Group as={Row} className="mb-3" controlId="msgs">
                <Form.Label column sm={2}>Output</Form.Label>
                <Col>
                    <AceWrapper
                        mode="text"
                        name="msgs"
                        snippet={scriptMessages.join("\n")}
                        height="150px"
                        readOnly={true}
                        focus={false}
                        onChange={() => { }}
                        tabIndex={0}
                        writeHandler={save}
                        defaultValue=""
                        showGutter={false}
                    />
                </Col>
            </Form.Group>
        </>
    )
}
