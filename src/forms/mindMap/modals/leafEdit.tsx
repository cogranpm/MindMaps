import React, {
    ReactElement,
    ReactNode,
    useContext,
    useState,
    useEffect,
    useRef,
} from "react";
import { Button, Col, Form, Modal, Row, Container } from "react-bootstrap";
import {
    audioQueue,
    AudioQueueItem,
    Leaf,
    LeafType,
    LEAF_TYPES,
    LongText,
    LongTextType,
    MindMap,
    SelectOption,
    Test,
} from "../../models/mindMaps/state";
import { AppContext } from "../../models/mindMaps/context";
import { ActionType } from "../../models/mindMaps/actions";
import { logMessage, logSystemError } from "../../../shared/errorHandling";
import { AceWrapper } from "../elements/ace_editor";
import { MindMapEditor } from "./mindMapEditor";
import { LinkEditor } from "./linkEditor";
import { SnippetEditor } from "./snippetEditor";
import { TestEditor } from "./testEditor";
import {
    findBranch,
    getMindMapFromCache,
    makeLongText,
    updateLeaf,
    makeMindMapWithLeaf,
    makeTest,
} from "../../models/mindMaps/factories";

import {
    Content,
    InitializeLeafResponse,
    PersistLeafResponse,
    WorkerMessageTypes,
} from "~src/shared/workerMessages";

import { initializeLeaf, persistLeaf } from "~src/shared/workerClient";
import { processAudioQueueResponse } from "~src/forms/models/mindMaps/modelHelpers/audioQueueHelper";
import * as styles from "../../forms.module.css";

export interface LeafEditorProps {
    leaf: Leaf;
}

const getEditorHeight = (theType: LeafType): number => {
    switch (parseInt(theType, 10)) {
        case LeafType.Test:
            return 55;
        case LeafType.Snippet:
            return 55;
        case LeafType.Link:
            return 275;
        case LeafType.MindMap:
            return 175;
        default:
            return 575;
    }
};

export const LeafEditor = (props: LeafEditorProps) => {
    const { state, dispatch } = useContext(AppContext);
    const [type, setType] = useState<LeafType>(() => props.leaf.type);
    const [title, setTitle] = useState(() => props.leaf.title);
    const [body, setBody] = useState<LongText | undefined>();
    const [url, setUrl] = useState(() => props.leaf.url);
    const [snippet, setSnippet] = useState<LongText | undefined>();
    const [childMindMap, setChildMindMap] = useState<MindMap | undefined>();
    const [addingChildMap, setAddingChildMap] = useState(false);
    const [editorHeight, setEditorHeight] = useState(
        getEditorHeight(props.leaf.type)
    );
    const formRef = useRef<HTMLFormElement>(null);
    const submitRef = useRef<HTMLButtonElement>(null);

    const [test, setTest] = useState<Test>(() => {
        return makeTest(props.leaf);
    });

    const mindMap = getMindMapFromCache(state) as MindMap;

    useEffect(() => {
        setEditorHeight(getEditorHeight(type));
    }, [type]);

    // initialize the component
    useEffect(() => {
        const execute = async () => {
            try {
                await initialize();
            } catch (err) {
                logSystemError(err, "Error in leaf edit initialize");
            }
        };
        execute();
    }, []);

    const initialize = async () => {
        initializeLeaf(props.leaf, initializeCallback);
    };

    const initializeCallback = (e: Content) => {
        const response = e as InitializeLeafResponse;
        setBody(response.body);
        switch (type) {
            case LeafType.Test:
                if (response.test) {
                    setTest(response.test as Test);
                    //need to reconcile the audio loaded with what is in the queue already
                    processAudioQueueResponse(response.audioQueueItems);
                }
                break;
            case LeafType.MindMap:
                if (response.mindMap) {
                    setChildMindMap(response.mindMap);
                    setAddingChildMap(false);
                } else {
                    const newMindMap = makeMindMapWithLeaf(props.leaf);
                    setChildMindMap(newMindMap);
                    setAddingChildMap(true);
                }
                break;
            case LeafType.Snippet:
                setSnippet(response.snippet);
                break;
            default:
        }
    };

    const handleClose = async () => {
        dispatch({
            type: ActionType.HideLeafEditor,
            payload: { updatedEntity: mindMap },
        });
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        await save();
    };

    const save = async () => {
        try {
            const branch = findBranch(mindMap, props.leaf.branchId);
            if (branch != undefined) {
                //push the primitive state values held in this component into the leaf
                const updatedLeaf = {
                    ...props.leaf,
                    title: title,
                    type: type,
                    url: url,
                };

                //update mind map parent in immutable style
                const updatedMindMap = updateLeaf(mindMap, branch, updatedLeaf);
                persistLeaf(
                    updatedLeaf,
                    updatedMindMap,
                    test,
                    body,
                    snippet,
                    audioQueue,
                    saveCallback
                );

            } else {
                logSystemError(
                    new Error(),
                    `Branch ${props.leaf.branchId} could not be found in mind map: ${mindMap.name}`
                );
            }
        } catch (err) {
            logSystemError(err, "Error in leaf save");
        }
    };

    const saveCallback = (e: Content) => {
        const response = e as PersistLeafResponse;
        //update the global state
        dispatch({
            type: ActionType.HideLeafEditor,
            payload: { updatedEntity: response.updatedMindMap },
        });

        //update the audio queue
        if (response.updatedAudioQueue) {
            response.updatedAudioQueue.forEach((item) => {
                const existing = audioQueue.get(item._id);
                if (existing) {
                    existing.questionDirty = false;
                    existing.answerDirty = false;
                }
            });
        }
    };

    const handleChangeTitle = (e: any) => {
        setTitle(e.target.value);
    };

    const handleChangeBody = (e: string) => {
        if (body) {
            setBody({ ...body, body: e });
        }
    };

    const handleChangeRadio = async (event: any) => {
        const value = parseInt(event.target.value, 10) as LeafType;
        setType(value);
        try {
            switch (value) {
                case LeafType.Test:
                    await initialize();
                    break;
                case LeafType.MindMap:
                    //this should destroy an existing mind map really
                    await initialize();
                    break;
                case LeafType.Snippet:
                    setSnippet(makeLongText(props.leaf.id, LongTextType.Snippet));
                    break;
                default:
                    break;
            }
        } catch (e) {
            logSystemError(e, "Error in leaf type onChange event");
        }
    };

    const externalSubmitHandler = async () => {
        if (submitRef.current) {
            // this just reloads everything
            submitRef.current.click();
        }
    };

    const getLeafTypeTitle = (type: LeafType): string => {
        const typeToTitleLookup = new Map<LeafType, string>([
            [LeafType.MindMap, "Mind Map"],
            [LeafType.Snippet, "Snippet"],
            [LeafType.Link, "Link"],
            [LeafType.Note, "Note"],
            [LeafType.Test, "Test"]
        ]);

        //type == LeafType.MindMap
        const separator = " - ";
        let title = "";
        const parsedType = parseInt(type, 10);
        if (typeToTitleLookup.has(parsedType)) {
            title = typeToTitleLookup.get(parsedType) as string;
        }
        return `${separator}${title}`;
    };

    return (
        <Modal show={true} onEscapeKeyDown={handleClose} onHide={handleClose} size="xl">

            <Modal.Header className={styles.modalHeader} closeButton>
                Editor{getLeafTypeTitle(type)}
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={(e: any) => handleSave(e)} ref={formRef}>
                    <Container>
                        <Row>
                            <Form.Group as={Row} className="mb-3" controlId="leafType">
                                <Form.Label column sm={2}>
                                    Type
                                </Form.Label>
                                <Col>
                                    {LEAF_TYPES.map((option: SelectOption) => (
                                        <Form.Check
                                            inline
                                            type="radio"
                                            id={"" + option.code}
                                            key={"" + option.code}
                                            name="type"
                                            value={option.code as number}
                                            onChange={handleChangeRadio}
                                            checked={type == option.code}
                                            label={option.label}
                                        />
                                    ))}
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3" controlId="title">
                                <Form.Label column sm={2}>
                                    Title
                                </Form.Label>
                                <Col>
                                    <Form.Control
                                        required
                                        type="text"
                                        name="title"
                                        size="sm"
                                        value={title}
                                        onChange={handleChangeTitle}
                                        onKeyDown={(e: any) => e.stopPropagation()}
                                    ></Form.Control>
                                </Col>
                            </Form.Group>
                            {type == LeafType.Link ? (
                                <LinkEditor url={url} setUrl={setUrl} />
                            ) : (
                                ""
                            )}

                            <Form.Group as={Row} className="mb-3" controlId="body">
                                <Form.Label column sm={2}>
                                    Body
                                </Form.Label>
                                <Col>
                                    <AceWrapper
                                        name="body"
                                        mode="markdown"
                                        showGutter={false}
                                        readOnly={false}
                                        defaultValue=""
                                        height={`${editorHeight}px`}
                                        snippet={body ? body.body : ""}
                                        onChange={handleChangeBody}
                                        tabIndex={0}
                                        focus={false}
                                        writeHandler={externalSubmitHandler}
                                    />
                                </Col>
                            </Form.Group>
                        </Row>
                        {type == LeafType.MindMap ? (
                            <MindMapEditor
                                leaf={props.leaf}
                                childMindMap={childMindMap}
                                setChildMindMap={setChildMindMap}
                                addingChildMap={addingChildMap}
                                saveHandler={save}
                            />
                        ) : (
                            ""
                        )}
                        {type == LeafType.Snippet ? (
                            <SnippetEditor
                                leaf={props.leaf}
                                snippet={snippet}
                                setSnippet={setSnippet}
                                submitRef={submitRef}
                            />
                        ) : (
                            ""
                        )}
                        {type == LeafType.Test ? (
                            <TestEditor leaf={props.leaf} test={test} setTest={setTest} />
                        ) : (
                            ""
                        )}
                        <Row>
                            <Col>
                            </Col>
                            <Col xs lg="2">
                                <Button title="Close" variant="secondary" onClick={handleClose}>
                                    Close
                                </Button>
                                <span style={{ marginLeft: "5px" }}></span>
                                <Button title="Save" variant="secondary" type="submit" ref={submitRef}>
                                    Submit
                                </Button>
                            </Col>
                        </Row>
                    </Container>
                </Form>
            </Modal.Body>
        </Modal>
    );
};
