import React, { useRef, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import EdiText from 'react-editext';
import { logMessage } from '../../../shared/errorHandling';

export interface TitleEditorProps {
    handleClose: () => void;
    handleSave: (e: string) => void;
    title: string;
}

export const TitleEditor = (props: TitleEditorProps) => {
    const theEditor = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (theEditor.current) {
            theEditor.current.select();
        }
    }, []);

    return (
        <Modal show={true}>
            <Modal.Body>
                <EdiText
                    type="text"
                    value={props.title}
                    onSave={props.handleSave}
                    onCancel={props.handleClose}
                    tabIndex={0}
                    editing={true}
                    editOnViewClick={true}
                    submitOnEnter={true}
                    submitOnUnfocus={false}
                    cancelOnEscape={true}
                    startEditingOnEnter={true}
                    showButtonsOnHover={false}
                    buttonsAlign="after"
                    hint="Enter title"
                    inputProps={{ autoFocus: true, ref: theEditor }}
                />
            </Modal.Body>
        </Modal>
    );
}