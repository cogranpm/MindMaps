import React, { Dispatch } from 'react';
import { Leaf } from '../../models/mindMaps/state';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';


interface LinkEditorProps {
    url?: string;
    setUrl: Dispatch<string>;
}

export const LinkEditor = (props: LinkEditorProps) => {

    const handleChange = (e: any) => {
        props.setUrl(e.target.value);
    }

    return (
            <Form.Group as={Row} className="mb-3" controlId="link">
                <Form.Label column sm={2}>Link</Form.Label>
                <Col>
                    <Form.Control
                        required
                        type="url"
                        name="link"
                        size="sm"
                        value={props.url}
                        onChange={handleChange}
                        onKeyDown={(e: any) => e.stopPropagation()}
                    >
                    </Form.Control>
                </Col>
            </Form.Group>
    )
}
