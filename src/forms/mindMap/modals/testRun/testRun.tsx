import React, { useContext, useState, useEffect } from "react";
import {
  Test,
  Leaf,
  TestRun,
  TestRunAnswer,
  Question,
  AnswerViewModel,
} from "../../../models/mindMaps/state";
import {
  Modal,
  Button,
  Container,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import { AppContext } from "../../../models/mindMaps/context";
import { ActionType } from "../../../models/mindMaps/actions";
import { logSystemError } from "../../../../shared/errorHandling";
import { TestRunList } from "./list";
import { TestRunEdit } from "./edit";
import { makeTestRun } from "../../../models/mindMaps/factories";
import { Content, LoadTestRunsResponse } from "~src/shared/workerMessages";
import { loadTestRuns, persistTestRun } from "~src/shared/workerClient";
import { processAudioQueueResponse } from "~src/forms/models/mindMaps/modelHelpers/audioQueueHelper";

export interface TestRunProps {
  leaf: Leaf;
}

export const TestRunEditor = (props: TestRunProps) => {
  const { state, dispatch } = useContext(AppContext);
  const [test, setTest] = useState<Test | undefined>(undefined);
  const [body, setBody] = useState<string>("");
  const [activeTestRun, setActiveTestRun] = useState<TestRun | undefined>(
    undefined
  );
  const [answers, setAnswers] = useState<AnswerViewModel[]>(
    new Array<AnswerViewModel>()
  );

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    /*
    const execute = async () => {
      try {
        //load the test
        const existing = await get(props.leaf.id);
        if (existing) {
          setTest(existing);
        }
        const longBody = await loadLeafBody(props.leaf);
        if (longBody) {
          setBody(longBody.body);
        }
      } catch (err) {
        logSystemError(err, `Error in Leaf View init Leaf: ${props.leaf.id}`);
      }
    };
    execute();
    */
    loadTestRuns(props.leaf, initCallback);
  };

  const initCallback = (e: Content) => {
    const response = e as LoadTestRunsResponse;
    setTest(response.test);
    setBody(response.body.body);
    processAudioQueueResponse(response.audioQueueItems);
  };

  const handleClose = () => {
    dispatch({ type: ActionType.HideTestRunEditor });
  };

  const onNew = () => {
    if (test) {
      const newTestRun = makeTestRun(test);
      setActiveTestRun(newTestRun);
    }
  };

  /*
  const submit = async () => {
    if (activeTestRun) {
      const recordedAnswers = answers.map((answer) => {
        return answer.answer;
      });
      activeTestRun.answers = recordedAnswers;
      if (test) {
        // persist the audio captured in this test run
        await persistTestRunAudio(answers);

        // persist this test run
        let updatedTestRuns = test.testRuns;
        const existing = test.testRuns.find(
          (testRun) => testRun.id === activeTestRun.id
        );
        if (!existing) {
          updatedTestRuns = [...test.testRuns, activeTestRun];
        } else {
          updatedTestRuns = test.testRuns.map((testRun) => {
            if (testRun.id === activeTestRun.id) {
              return activeTestRun;
            } else {
              return testRun;
            }
          });
        }
        let updatedTest = { ...test, testRuns: updatedTestRuns };
        updatedTest = await persist(updatedTest);
        setTest(updatedTest);
      }
    }
    setActiveTestRun(undefined);
  };
  */

  const submit = async () => {
    if (activeTestRun) {
      const recordedAnswers = answers.map((answer) => {
        return answer.answer;
      });
      activeTestRun.answers = recordedAnswers;
      if (test) {
        // persist this test run
        let updatedTestRuns = test.testRuns;
        const existing = test.testRuns.find(
          (testRun) => testRun.id === activeTestRun.id
        );
        if (!existing) {
          updatedTestRuns = [...test.testRuns, activeTestRun];
        } else {
          updatedTestRuns = test.testRuns.map((testRun) => {
            if (testRun.id === activeTestRun.id) {
              return activeTestRun;
            } else {
              return testRun;
            }
          });
        }
        let updatedTest = { ...test, testRuns: updatedTestRuns };
        persistTestRun(updatedTest, answers, submitCallback);
      }
    }
  };

  const submitCallback = (e: Content) => {
    const updatedTest = e as Test;
    setTest(updatedTest);
    setActiveTestRun(undefined);
  };

  const cancel = async () => {
    setActiveTestRun(undefined);
  };

  return (
    <Modal show={true} onHide={handleClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Test Runs</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {test ? (
          <Container>
            {activeTestRun ? (
              ""
            ) : (
              <Row>
                <Col>
                  <Button onClick={onNew}>
                    <Plus />
                  </Button>
                </Col>
              </Row>
            )}

            <Row>
              <Col>
                {activeTestRun ? (
                  <TestRunEdit
                    test={test}
                    body={body}
                    testRun={activeTestRun}
                    answers={answers}
                    setAnswers={setAnswers}
                    submit={submit}
                    cancel={cancel}
                  />
                ) : (
                  <TestRunList
                    test={test}
                    setActiveTestRun={setActiveTestRun}
                  />
                )}
              </Col>
            </Row>
          </Container>
        ) : (
          ""
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button title="Close" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
