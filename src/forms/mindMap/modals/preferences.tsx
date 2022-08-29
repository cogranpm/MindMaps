import React, { Dispatch, useState } from 'react';
import { Modal, Form, Container, Row, Col, Button } from 'react-bootstrap';
import { EDITOR_KEYBINDINGS, EDITOR_THEMES, getPreference, PreferenceOption, PREFERENCE_COUCHURL, PREFERENCE_EDITOR_KEYBINDING, PREFERENCE_EDITOR_THEME, setPreference } from '../../../shared/preferences';

export interface PreferenceEditorProps {
    setClose: Dispatch<boolean>;
}

export const PreferenceEditor = (props: PreferenceEditorProps) => {

    const [couchUrl, setCouchUrl] = useState(getPreference(PREFERENCE_COUCHURL));
    const [editorTheme, setEditorTheme] = useState(getPreference(PREFERENCE_EDITOR_THEME, "chrome"));
    const [editorKeyBinding, setEditorKeyBinding] = useState(getPreference(PREFERENCE_EDITOR_KEYBINDING, "vim"));

    const handleChangeUrl = (e: any) => {
        setCouchUrl(e.target.value);
    };

    const handleChangeTheme = async (event: any) => {
        setEditorTheme(event.target.value);
    };

    const handleChangeKeybinding = async (event: any) => {
        setEditorKeyBinding(event.target.value);
    };

    const handleSave = (e: any) => {
        e.preventDefault();
        setPreference(PREFERENCE_COUCHURL, couchUrl);
        setPreference(PREFERENCE_EDITOR_THEME, editorTheme);
        setPreference(PREFERENCE_EDITOR_KEYBINDING, editorKeyBinding);
        props.setClose(false);
    };

    const handleClose = (e: any) => {
        props.setClose(false);
    };

    return (
        <Modal show={true} size="lg">
            <Modal.Body>
                <h4>Preferences</h4>
                <Form onSubmit={(e: any) => handleSave(e)}>
                    <Container>
                        <Row>
                            <Form.Group as={Row} className="mb-3" controlId="couchUrl">
                                <Form.Label column sm={4}>URL of CouchDB Server</Form.Label>
                                <Col sm={10}>
                                    <Form.Control
                                        placeholder="http://[server]:5984 or https://[server]:6984"
                                        type="text"
                                        name="couchUrl"
                                        size="sm"
                                        value={couchUrl}
                                        onChange={handleChangeUrl}
                                        tabIndex={-1}
                                        autoFocus
                                    >
                                    </Form.Control>
                                </Col>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Row} className="mb-3" controlId="editorTheme">
                                <Form.Label column sm={4}>Editor Theme</Form.Label>
                                <Col sm={10}>
                                    <Form.Select
                                        aria-label="Editor Theme"
                                        name="editorTheme"
                                        size="sm"
                                        value={editorTheme}
                                        onChange={handleChangeTheme}
                                    >
                                        {EDITOR_THEMES.map((option: PreferenceOption) => (
                                            <option key={option.code} value={option.code}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Row} className="mb-3" controlId="editorKeybinding">
                                <Form.Label column sm={4}>Editor Keybinding</Form.Label>
                                <Col sm={10}>
                                    <Form.Select
                                        aria-label="Editor Keybinding"
                                        name="editorKeybinding"
                                        size="sm"
                                        value={editorKeyBinding}
                                        onChange={handleChangeKeybinding}
                                    >
                                        {EDITOR_KEYBINDINGS.map((option: PreferenceOption) => (
                                            <option key={option.code} value={option.code}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Col></Col>
                            <Col>
                                <Button title="Close" onClick={handleClose}>
                                    Close
                                </Button>
                                <Button title="Save" type="submit">
                                    Submit
                                </Button>
                            </Col>
                        </Row>
                    </Container>
                </Form>
            </Modal.Body>
        </Modal>
    );
}