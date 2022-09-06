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

export interface LeafEditorProps {
    leaf: Leaf;
}

const getEditorHeight = (theType: LeafType): number => {
    switch (theType) {
        case LeafType.Test:
            return 275;
        case LeafType.Snippet:
            return 75;
        case LeafType.Link:
            return 275;
        case LeafType.MindMap:
            return 375;
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
        /*
        await initializeBody();
        await initializeOtherTypes();
        */
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

    /*
    const initializeBody = async () => {
      const existing = await loadLeafBody(props.leaf);
      if (!existing) {
        setBody(makeLongText(props.leaf.id, LongTextType.Body));
      } else {
        setBody(existing as LongText);
      }
    };

    const initializeOtherTypes = async () => {
      switch (type) {
        case LeafType.Test:
          initializeTest();
          break;
        case LeafType.MindMap:
          await initializeMindMap();
          break;
        case LeafType.Snippet:
          await initializeSnippet();
          break;
        default:
      }
    };

    const initializeSnippet = async () => {
      const existingSnippet = await loadSnippet(props.leaf);
      if (!existingSnippet) {
        setSnippet(makeLongText(props.leaf.id, LongTextType.Snippet));
      } else {
        setSnippet(existingSnippet as LongText);
      }
    };

    const initializeMindMap = async () => {
      const existingMindMap = await loadMindmapByLeaf(props.leaf);
      if (!existingMindMap) {
        const newMindMap = makeMindMapWithLeaf(props.leaf);
        setChildMindMap(newMindMap);
        setAddingChildMap(true);
      } else {
        setChildMindMap(existingMindMap as MindMap);
        setAddingChildMap(false);
      }
    };
    const initializeMindMap = async () => {
      find(
        FETCH_ID_GETMINDMAPBYLEAF,
        {
          selector: { leafId: props.leaf.id },
        },
        initializeMindMapCallback
      );
    };

    const initializeMindMapCallback = (e: Content) => {
      const result = e as PouchDB.Find.FindResponse<Content>;
      if (result.docs.length === 0) {
        const newMindMap = makeMindMapWithLeaf(props.leaf);
        setChildMindMap(newMindMap);
        setAddingChildMap(true);
      } else {
        const firstResult = result.docs[0];
        const existing = firstResult as unknown as MindMap;
        setChildMindMap(existing);
        setAddingChildMap(false);
      }
    };

    const initializeTest = async () => {
      const existing = await get(props.leaf.id);
      if (existing) {
        await setTest(existing as Test);
        await loadTestAudio(existing as Test);
      }
    };
    */

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

                /*write to the database
                const updatedEntity = await persist(updatedMindMap);
                await saveOther();
                await saveBody();

                //update the global state
                dispatch({
                  type: ActionType.HideLeafEditor,
                  payload: { updatedEntity: updatedEntity },
                });
                */
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

    /*
    const saveBody = async () => {
      if (body) {
        const updatedBody = await persistLongText(body as LongText);
      }
    };

    const saveOther = async () => {
      // save the externally related stuff
      switch (type) {
        case LeafType.Test:
          await saveTest();
          break;
        case LeafType.Snippet:
          if (snippet) {
            const updatedBody = await persistLongText(snippet as LongText);
          }
          break;
        default:
      }
    };

    const saveTest = async () => {
      setTest(await persistTest(test));
      await persistTestAudio(test);
    };
    */

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
                    //await initializeTest();
                    await initialize();
                    break;
                case LeafType.MindMap:
                    //this should destroy an existing mind map really
                    //await initializeMindMap();
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
            //await formRef.current.submit();
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
        if (typeToTitleLookup.has(type)) {
            title = typeToTitleLookup.get(type) as string;
        }
        return `${separator}${title}`;
    };

    return (
        <Modal show={true} onEscapeKeyDown={handleClose} size="xl">
            <Modal.Body>
                <p style={{
                    fontFamily: "'IBM Plex Mono', san serif",
                    fontWeight: "bold",
                    fontSize: "18pt"
                }}>Editor{getLeafTypeTitle(type)}</p>
                <hr />

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
                        <Row>
                            <Col>
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
                            </Col>
                        </Row>
                        <Row>
                          <Col>
                          </Col>
                          <Col xs lg="2">
                                <Button title="Close" variant="secondary" onClick={handleClose}>
                                    Close
                                </Button>
                                <span style={{marginLeft:"5px"}}></span>
                                <Button title="Save" variant="secondary" type="submit" ref={submitRef}>
                                    Submit
                                </Button>
                            </Col>
                        </Row>
                    </Container>
                </Form>
            </Modal.Body>
            <Modal.Footer></Modal.Footer>
        </Modal>
    );
};
