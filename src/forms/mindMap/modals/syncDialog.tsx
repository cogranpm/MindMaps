import React, { Dispatch, useState, useContext } from "react";
//import { sync } from './sync';
import {
    logMessage,
    logSystemError,
    SyncError,
} from "../../../shared/errorHandling";
//import { getCouchDBUri } from "../config";
import { Alert, Modal, Form, Button } from "react-bootstrap";
import {
    getPreference,
    PREFERENCE_COUCHURL,
} from "../../../shared/preferences";
import {
    replicate,
    SyncReturnInfo,
    SyncReturnMessage,
} from "../../models/mindMaps/localDataSync";
import { ActionType } from "../../models/mindMaps/actions";
import { AppContext } from "../../models/mindMaps/context";
import { Content } from "~src/shared/workerMessages";
import { find, sync } from "~src/shared/workerClient";
import { BUTTON_VARIANT, FETCH_ID_LOADMINDMAPS, FETCH_ID_SYNC } from "~src/shared/constants";
import { MindMapViewModel } from "~src/forms/models/mindMaps/state";
import * as styles from "../../forms.module.css";


export interface SyncDialogProps {
    setShow: Dispatch<boolean>;
}

export function SyncDialog(props: SyncDialogProps) {
    const { state, dispatch } = useContext(AppContext);
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [complete, setComplete] = useState(false);
    const [inProgress, setInProgress] = useState(false);

    function userNameHandler(e: any) {
        setUserName(e.target.value);
    }

    function passwordHandler(e: any) {
        setPassword(e.target.value);
    }

    async function handleSubmit() {
        setInProgress(true);
        setErrorMessage("");
        setIsError(false);
        sync(
            FETCH_ID_SYNC,
            getPreference(PREFERENCE_COUCHURL),
            {
                auth: { username: userName, password: password },
            },
            syncCompleteCallback
        );
    }

    const syncCompleteCallback = (e: Content) => {
        // examine the response for errors
        if (!unpackSyncResult(e)) {
            setIsError(true);
            setInProgress(false);
            return;
        }
        find(
            FETCH_ID_LOADMINDMAPS,
            {
                selector: {
                    name: { $exists: true },
                    leafId: { $exists: false },
                },
                sort: ["name"],
                fields: ["name", "_id", "leafId"],
            },
            refreshCallback
        );
    };

    const unpackSyncResult = (e: Content): boolean => {
        const result = e as Array<SyncReturnInfo>;
        let hasError = false;
        const adaptedMessages = result.map((returnInfo) => {
            if (!returnInfo.ok) {
                hasError = true;
            }
            const returnMessages = returnInfo.info.map((info) => {
                return unpackSyncErrors(info);
            });
            return returnMessages.flat(1);
        });
        setErrorMessage(adaptedMessages.flat(1).join(" "));
        return !hasError;
    };

    const unpackSyncErrors = (info: SyncReturnMessage): string[] => {
        const returnErrors = info.errors.map((error) => {
            if (error.hasOwnProperty("message")) {
                return error.message;
            } else {
                return "";
            }
        });
        return returnErrors.flat(1);
    };

    const refreshCallback = (e: Content) => {
        const result = e as PouchDB.Find.FindResponse<Content>;
        const entities = result.docs
            .filter((doc) => !doc.hasOwnProperty("leafId"))
            .map((doc) => {
                const model = doc as unknown as MindMapViewModel;
                return model;
            });
        dispatch({ type: ActionType.InitList, payload: { items: entities } });
        setComplete(true);
        setInProgress(false);
    };

    const handleClose = () => {
        props.setShow(false);
    };

    return (
        <Modal size="xl" onEscapeKeyDown={handleClose} onHide={handleClose} show={true}>
            <Modal.Header className={styles.modalHeader} closeButton>
                Sync
            </Modal.Header>
            <Modal.Body>
                {isError ? (
                    <Alert variant="danger" onClose={() => setIsError(false)} dismissible>
                        <Alert.Heading>Error recieved during Sync</Alert.Heading>
                        <p>{errorMessage}</p>
                    </Alert>
                ) : (
                    ""
                )}
              {complete ? <Alert variant="success">Sync Complete</Alert> : ""}
                <Form id="frmSync">
                    <Form.Group className="mb-3" controlId="userName">
                        <Form.Label>User Name</Form.Label>
                        <Form.Control
                            placeholder="Enter CouchDB user"
                            onChange={userNameHandler}
                            name="userName"
                            value={userName}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter CouchDB password"
                            onChange={passwordHandler}
                            name="password"
                            value={password}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="server">
                        <Form.Label>Server</Form.Label>
                        <Form.Control
                            type="text"
                            readOnly
                            name="server"
                            value={getPreference(PREFERENCE_COUCHURL)}
                        />
                    </Form.Group>
                </Form>

            </Modal.Body>
            <Modal.Footer>
                <Button title="Close" variant={BUTTON_VARIANT} onClick={handleClose}>
                    Close
                </Button>
                <Button title="Sync" variant={BUTTON_VARIANT} onClick={handleSubmit} disabled={inProgress}>
                    Sync
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
