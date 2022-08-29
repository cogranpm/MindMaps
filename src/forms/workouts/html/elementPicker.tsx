import React, { useState } from "react";
import { HtmlElement } from "~src/forms/models/workouts/htmlElement";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import { EMBEDDED_ELEMENTS, FORM_ELEMENTS, IMAGE_MULTIMEDIA_ELEMENTS, INLINE_TEXT_ELEMENTS, INLINE_TEXT_ELEMENTS_A, INLINE_TEXT_ELEMENTS_B, METADATA_ELEMENTS, SECTIONING_ELEMENTS, TABLE_ELEMENTS, TEXT_BODY_ELEMENT, TEXT_ELEMENTS } from "~src/forms/models/workouts/elements";


export type ElementPickerProps = {
    element: HtmlElement | undefined;
    setShowPicker: React.Dispatch<React.SetStateAction<boolean>>;
    saveHandler: (state: [type: string, textBody?: string, attributes?: string]) => void;
}

export const ElementPicker = (props: ElementPickerProps) => {

    const [type, setType] = useState<string>(props.element ? props.element.type : "div");
    const [textBody, setTextBody] = useState<string>(props.element ? props.element.body ?? "" : "");
    const [attributes, setAttributes] = useState<string>(props.element ? props.element.attributes ?? "" : "")

    const handleClose = () => {
        props.setShowPicker(false);
    };

    const handleSave = () => {
        props.saveHandler([type, textBody, attributes]);
    }

    const handleTextBodyChange = (e: any) => {
        setTextBody(e.target.value);
    };

    const handleAttributesChange = (e: any) => {
        setAttributes(e.target.value);
    };

    const handleChange = (e: any) => {
        setType(e.target.value);
    };

    const renderRadio = (element: string) => {
        return (
            <Form.Check type="radio" id={`${element}`} >
                <Form.Check.Input type="radio" name="element" isValid checked={type === element} value={element} onChange={handleChange} />
                <Form.Check.Label htmlFor={`${element}`}>{`${element}`}</Form.Check.Label>
            </Form.Check>
        );
    };

    const renderElement = (element: string, idx: number) => {
        return renderRadio(element);
    };

    const renderElements = () => {
        return (
            <table>
                <tr>
                    <td><h6>Section</h6></td>
                    <td><h6>Forms</h6></td>
                    <td><h6>Table</h6></td>
                    <td><h6>Metadata</h6></td>
                    <td><h6>Text</h6></td>
                    <td colSpan={3}><h6>Inline</h6></td>
                    <td><h6>Image/Multimedia</h6></td>
                    <td><h6>Embedded</h6></td>
                </tr>
                <tr>
                    <td key={`SECTIONING`} className="mb-3">
                        {renderElement(TEXT_BODY_ELEMENT, 0)}
                        {SECTIONING_ELEMENTS.map((element, idx) => {
                            return renderElement(element, idx);
                        }
                        )}
                    </td>
                    <td key={`FORM`} className="mb-3">
                        {FORM_ELEMENTS.map((element, idx) => {
                            return renderElement(element, idx);
                        }
                        )}
                    </td>
                    <td key={`TABLE`} className="mb-3">
                        {TABLE_ELEMENTS.map((element, idx) => {
                            return renderElement(element, idx);
                        }
                        )}
                    </td>
                    <td key={`METADATA`} className="mb-3">
                        {METADATA_ELEMENTS.map((element, idx) => {
                            return renderElement(element, idx);
                        }
                        )}
                    </td>
                    <td key={`TEXT`} className="mb-3">
                        {TEXT_ELEMENTS.map((element, idx) => {
                            return renderElement(element, idx);
                        }
                        )}
                    </td>
                    <td key={`INLINETEXT`} className="mb-3">
                        {INLINE_TEXT_ELEMENTS.map((element, idx) => {
                            return renderElement(element, idx);
                        }
                        )}
                    </td>
                    <td key={`INLINETEXT_A`} className="mb-3">
                        {INLINE_TEXT_ELEMENTS_A.map((element, idx) => {
                            return renderElement(element, idx);
                        }
                        )}
                    </td>
                    <td key={`INLINETEXT_B`} className="mb-3">
                        {INLINE_TEXT_ELEMENTS_B.map((element, idx) => {
                            return renderElement(element, idx);
                        }
                        )}
                    </td>
                    <td key={`IMAGEMEDIA`} className="mb-3">
                        {IMAGE_MULTIMEDIA_ELEMENTS.map((element, idx) => {
                            return renderElement(element, idx);
                        }
                        )}
                    </td>
                    <td key={`EMBEDDED`} className="mb-3">
                        {EMBEDDED_ELEMENTS.map((element, idx) => {
                            return renderElement(element, idx);
                        }
                        )}
                    </td>
                </tr>
            </table>
        );
    };

    return (
        <Modal show={true} onHide={handleClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Element Properties</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <div>
                        {renderElements()}
                    </div>
                    <div>
                        <Form.Label>Text Body</Form.Label>
                        <Form.Control as="textarea" rows={3} value={textBody} onChange={handleTextBodyChange} />
                    </div>
                    <div>
                        <Form.Label>Attributes</Form.Label>
                        <Form.Control
                          name="attributes"
                          value={attributes}
                          onChange={handleAttributesChange} />
                    </div>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary" onClick={handleSave}>Save Changes</Button>
            </Modal.Footer>
        </Modal>
    );
};
