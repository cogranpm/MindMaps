import React, {
  Dispatch,
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
import ReactMarkdown from "react-markdown";
import {
  Test,
  TestRunAnswer,
  TestRun,
  Question,
  Mark,
  audioQueue,
  AudioQueueItem,
  AnswerViewModel,
} from "../../../models/mindMaps/state";
import {
  ToggleButton,
  ButtonGroup,
  Button,
  Container,
  Row,
  Col,
  Table,
  Card,
} from "react-bootstrap";
import {
  ArrowLeftSquare,
  ArrowRightSquare,
  CheckSquare,
  QuestionSquare,
  XSquare,
  HandThumbsUp,
  HandThumbsDown,
} from "react-bootstrap-icons";
import { AudioRecording } from "../../../../shared/webAudio";
import { AudioRecordingView } from "../../elements/audioView";
import { logMessage } from "../../../../shared/errorHandling";
import { Content } from "~src/shared/workerMessages";
import { loadAnswers } from "~src/shared/workerClient";
//import styles from '../../../forms.module.css';

type TestRunEditProps = {
  body: string;
  test: Test;
  testRun: TestRun;
  answers: AnswerViewModel[];
  setAnswers: Dispatch<AnswerViewModel[]>;
  submit: () => void;
  cancel: () => void;
};

const answerRecorder = new AudioRecording();
const toggles = ["Unmarked", "Correct", "Incorrect"];

export const TestRunEdit = (props: TestRunEditProps) => {
  const [currentAnswer, setCurrentAnswer] = useState<
    AnswerViewModel | undefined
  >(undefined);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioDirty, setAudioDirty] = useState(false);
  const theTable = useRef<HTMLTableElement>(null);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    setCurrentAnswer(props.answers[currentIndex]);
  }, [currentIndex]);

  const init = () => {
    /*
    const execute = async () => {
      await loadTestAudio(props.test);
      const viewModel = await Promise.all(
        props.test.questions.map(async (question) => {
          let theAnswer = props.testRun.answers.find(
            (answer: TestRunAnswer) => answer.questionId === question.id
          );
          let audioBlob: Blob | undefined = undefined;
          if (!theAnswer) {
            theAnswer = makeTestRunAnswer(props.testRun, question);
          } else {
            audioBlob = await loadTestRunAudio(theAnswer.id);
          }
          return {
            audioBlob: audioBlob,
            answer: theAnswer,
            audioBlobDirty: false,
            question: question,
          } as AnswerViewModel;
        })
      );

      props.setAnswers(viewModel);
      if (viewModel.length > 0) {
        setCurrentAnswer(viewModel[0]);
      }
    };

    answerRecorder.mediaRecorder.onstop = stopHandler;
    execute();
    */
   loadAnswers(props.test, props.testRun, initCallback);
  };

  const initCallback = (e: Content) => {
    const viewModel = e as AnswerViewModel[];
      props.setAnswers(viewModel);
      if (viewModel.length > 0) {
        setCurrentAnswer(viewModel[0]);
      }
    answerRecorder.mediaRecorder.onstop = stopHandler;
  };

  useEffect(() => {
    if (audioDirty) {
      if (currentAnswer) {
        const updatedAnswer = {
          ...currentAnswer,
          audioBlob: answerRecorder.audioToBlob(),
          audioBlobDirty: true,
          answer: { ...currentAnswer.answer, createDate: Date.now() },
        };
        //currentAnswer.audioBlob = answerRecorder.audioToBlob();
        //currentAnswer.answer.createDate = Date.now();
        const updatedAnswers = props.answers.map((answer) => {
          if (answer.answer.id === currentAnswer.answer.id) {
            return updatedAnswer;
          } else {
            return answer;
          }
        });
        props.setAnswers(updatedAnswers);
        setCurrentAnswer(updatedAnswer);
      }
      setAudioDirty(false);
    }
  }, [audioDirty]);

  const stopHandler = () => {
    setAudioDirty(true);
  };

  const play = () => {
    if (currentAnswer) {
      const audioQueueItem = audioQueue.get(currentAnswer.question.id);
      if (audioQueueItem) {
        if (audioQueueItem.questionBlob) {
          AudioRecording.playAudioBlob(audioQueueItem.questionBlob);
        }
      }
    }
  };

  const playCorrectAnswer = () => {
    if (currentAnswer) {
      const audioQueueItem = audioQueue.get(currentAnswer.question.id);
      if (audioQueueItem) {
        if (audioQueueItem.answerBlob) {
          AudioRecording.playAudioBlob(audioQueueItem.answerBlob);
        }
      }
    }
  };

  const handleAnswerMark = (index: number) => {
    if (currentAnswer) {
      currentAnswer.answer.mark = index;
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const next = () => {
    if (currentIndex < props.answers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const submit = async () => {
    //save all the audio
    await props.submit();
  };

  const handleRowClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <Container>
      <Row>
        <Col>
          <ReactMarkdown>{props.body}</ReactMarkdown>
        </Col>
        <Col></Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              {currentAnswer ? currentAnswer.question.title : ""}
            </Card.Header>
            <Card.Body>
              <Container>
                <Row>
                  <Col>1: Play Question</Col>
                  <Col>
                    <Button className="float-end" onClick={play}>
                      Play
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col>2: Record your answer</Col>
                  <Col>
                    <div className="float-sm-end">
                      <AudioRecordingView
                        recorder={answerRecorder}
                        blob={
                          currentAnswer ? currentAnswer.audioBlob : undefined
                        }
                        disabled={currentAnswer === undefined}
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col>3: Listen to Solution</Col>
                  <Col>
                    <Button className="float-end" onClick={playCorrectAnswer}>
                      Play
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col>4. Mark your answer</Col>
                  <Col>
                    <ButtonGroup className="float-end">
                      {toggles.map((radio, idx) => (
                        <ToggleButton
                          key={idx}
                          id={`radio-${idx}`}
                          type="radio"
                          variant={
                            idx % 2 ? "outline-success" : "outline-danger"
                          }
                          name="radio"
                          value={radio}
                          checked={
                            currentAnswer
                              ? currentAnswer.answer.mark === idx
                              : false
                          }
                          onChange={() => handleAnswerMark(idx)}
                        >
                          {radio}
                        </ToggleButton>
                      ))}
                    </ButtonGroup>
                  </Col>
                </Row>
                <Row>
                  <Col>5: Next Question</Col>
                  <Col>
                    <ButtonGroup
                      aria-label="Navigation"
                      className="mb-2 float-end"
                    >
                      <Button onClick={prev} disabled={currentIndex === 0}>
                        <ArrowLeftSquare />
                      </Button>
                      <Button
                        onClick={next}
                        disabled={currentIndex >= props.answers.length - 1}
                      >
                        <ArrowRightSquare />
                      </Button>
                      <Button onClick={submit}>Submit</Button>
                      <Button onClick={() => props.cancel()}>Cancel</Button>
                    </ButtonGroup>
                  </Col>
                </Row>
              </Container>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Table bordered hover variant="light" id="tblList" ref={theTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Answered</th>
                <th>Mark</th>
              </tr>
            </thead>
            <tbody>
              {props.answers.map((item, index) => (
                <tr
                  key={item.answer.id}
                  onClick={() => handleRowClick(index)}
                  className={currentIndex === index ? "table-primary" : ""}
                >
                  <td>{index + 1}</td>
                  <td>{item.question.title}</td>
                  <td>
                    {item.audioBlob ? <HandThumbsUp /> : <HandThumbsDown />}
                  </td>
                  <td>
                    {item.answer.mark === Mark.Unmarked ? (
                      <QuestionSquare />
                    ) : item.answer.mark === Mark.Correct ? (
                      <CheckSquare />
                    ) : (
                      <XSquare />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};
