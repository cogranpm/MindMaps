import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../models/mindMaps/context";
import { ActionType } from "../../models/mindMaps/actions";
import {
  Modal,
  Button,
  Table,
  Container,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  audioQueue,
  AudioQueueItem,
  Leaf,
  LeafType,
  MindMap,
  Question,
  Test,
} from "../../models/mindMaps/state";
import ReactMarkdown from "react-markdown";
import { logSystemError } from "../../../shared/errorHandling";
import { formatDateAndTime } from "../../../shared/dateAndTime";
import { AudioRecording } from "../../../shared/webAudio";

import { HandThumbsDown, PlayBtnFill } from "react-bootstrap-icons";
import { Content, InitializeLeafResponse } from "~src/shared/workerMessages";
import { initializeLeaf } from "~src/shared/workerClient";
import { processAudioQueueResponse } from "~src/forms/models/mindMaps/modelHelpers/audioQueueHelper";

export interface LeafViewProps {
  leaf: Leaf;
}

export const LeafViewer = (props: LeafViewProps) => {
  const [body, setBody] = useState("");
  const [mindMap, setMindMap] = useState<MindMap | undefined>(undefined);
  const [test, setTest] = useState<Test | undefined>(undefined);
  const [snippet, setSnippet] = useState("");

  const { state, dispatch } = useContext(AppContext);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    const execute = async () => {
      try {
        initializeLeaf(props.leaf, initializeCallback);

        /*
        const longBody = await loadLeafBody(props.leaf);
        if (longBody) {
          setBody(longBody.body);
        }
        if (props.leaf.type === LeafType.MindMap) {
          const existingMindMap = await loadMindmapByLeaf(props.leaf);
          if (existingMindMap) {
            setMindMap(existingMindMap);
          }
        }

        if (props.leaf.type === LeafType.Test) {
          const existing = await getTest(props.leaf.id);
          if (existing) {
            await setTest(existing as Test);
            await loadTestAudio(existing as Test);
          }
        }

        if (props.leaf.type === LeafType.Snippet) {
          const existing = await loadSnippet(props.leaf);
          if (existing) {
            await setSnippet(existing.body);
          }
        }
*/
      } catch (err) {
        logSystemError(err, `Error in Leaf View init Leaf: ${props.leaf.id}`);
      }
    };
    execute();
  };

  const initializeCallback = (e: Content) => {
    const response = e as InitializeLeafResponse;
    if (response.body) {
      setBody(response.body.body);
    }
    switch (props.leaf.type) {
      case LeafType.Test:
        if (response.test) {
          setTest(response.test);
          processAudioQueueResponse(response.audioQueueItems);
        }
        break;
      case LeafType.MindMap:
        if (response.mindMap) {
          setMindMap(response.mindMap);
        } 
        break;
      case LeafType.Snippet:
        if (response.snippet) {
          setSnippet(response.snippet.body);
        }
        break;
      default:
    }
  };

  const handleClose = () => {
    dispatch({ type: ActionType.HideLeafViewer });
  };

  const renderMindMapTip = () => {
    return <Tooltip>Open in new tab</Tooltip>;
  };

  const handleMindMap = () => {
    if (mindMap) {
      dispatch({ type: ActionType.OpenTab, payload: { entity: mindMap } });
      dispatch({ type: ActionType.HideLeafViewer });
    }
  };

  const hasAudio = (
    question: Question,
    isForQuestionAudioFlag: boolean
  ): boolean => {
    if (audioQueue.has(question.id)) {
      const item = audioQueue.get(question.id) as AudioQueueItem;
      return isForQuestionAudioFlag
        ? item.questionBlob !== undefined
        : item.answerBlob !== undefined;
    } else {
      return false;
    }
  };

  const hasAnswerAudio = (question: Question): boolean => {
    return hasAudio(question, false);
  };
  const hasQuestionAudio = (question: Question): boolean => {
    return hasAudio(question, true);
  };

  const playAnswer = (question: Question) => {
    const audioQueueItem = audioQueue.get(question.id);
    if (audioQueueItem) {
      if (audioQueueItem.answerBlob) {
        AudioRecording.playAudioBlob(audioQueueItem.answerBlob);
      }
    }
  };

  const playQuestion = (question: Question) => {
    const audioQueueItem = audioQueue.get(question.id);
    if (audioQueueItem) {
      if (audioQueueItem.questionBlob) {
        AudioRecording.playAudioBlob(audioQueueItem.questionBlob);
      }
    }
  };

  const makeQuestionTable = () => {
    return (
      <Table striped bordered hover variant="light">
        <caption>Questions</caption>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Added</th>
            <th>Question</th>
            <th>Answer</th>
          </tr>
          {test
            ? test.questions.map((question, index) => {
                return (
                  <tr key={question.id}>
                    <td>{index + 1}</td>
                    <td>{question.title}</td>
                    <td>{formatDateAndTime(new Date(question.createDate))}</td>
                    <td>
                      {hasQuestionAudio(question) ? (
                        <Button onClick={() => playQuestion(question)}>
                          <PlayBtnFill />
                        </Button>
                      ) : (
                        <HandThumbsDown />
                      )}
                    </td>
                    <td>
                      {hasAnswerAudio(question) ? (
                        <Button onClick={() => playAnswer(question)}>
                          <PlayBtnFill />
                        </Button>
                      ) : (
                        <HandThumbsDown />
                      )}
                    </td>
                  </tr>
                );
              })
            : ""}
        </thead>
      </Table>
    );
  };

  return (
    <Modal show={true} onHide={handleClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          {props.leaf.type === LeafType.Link ? (
            <a href={props.leaf.url} target="_blank" rel="noreferrer">
              {props.leaf.title}
            </a>
          ) : (
            props.leaf.title
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          {props.leaf.type === LeafType.MindMap ? (
            <Row>
              <Col>
                <OverlayTrigger placement="top" overlay={renderMindMapTip}>
                  <Button variant="outline-primary" onClick={handleMindMap}>
                    {mindMap ? mindMap.name : "Not Set"}
                  </Button>
                </OverlayTrigger>
              </Col>
            </Row>
          ) : (
            ""
          )}
          <Row>
            <Col>
              <ReactMarkdown>{body}</ReactMarkdown>
            </Col>
          </Row>
          {props.leaf.type === LeafType.Test ? (
            <Row>
              <Col>{makeQuestionTable()}</Col>
            </Row>
          ) : (
            ""
          )}
          {props.leaf.type === LeafType.Snippet ? (
            <>
              <Row>
                <Col>
                  <h2>Snippet</h2>
                </Col>
              </Row>
              <Row>
                <Col>
                  <pre>
                    <code>{snippet}</code>
                  </pre>
                </Col>
              </Row>
            </>
          ) : (
            ""
          )}
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button title="Close" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
