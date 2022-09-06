import React, { Dispatch, useState, useEffect } from 'react';
import { audioQueue, Leaf, Question, Test, AudioQueueItem } from '../../models/mindMaps/state';
import { Button, Col, Form, Modal, Row, Container, Table } from 'react-bootstrap';
import { Plus, Trash, VolumeMute, HandThumbsDown, HandThumbsUp } from 'react-bootstrap-icons';
import { AudioRecording } from '../../../shared/webAudio';
import { AudioRecordingView } from '../elements/audioView';
import { formatDateAndTime } from '../../../shared/dateAndTime';
import { makeQuestion } from '../../models/mindMaps/factories';
import { makeAudioQueueItem } from '../../models/mindMaps/blobFactory';
import { logSystemError } from '../../../shared/errorHandling';


interface TestEditorProps {
    leaf: Leaf;
    test: Test;
    setTest: Dispatch<Test>;
}

const questionRecorder = new AudioRecording();
const answerRecorder = new AudioRecording();

export const TestEditor = (props: TestEditorProps) => {

    const [current, setCurrent] = useState<Question | undefined>(undefined);
    const [questionBlob, setQuestionBlob] = useState<Blob | undefined>(undefined);
    const [answerBlob, setAnswerBlob] = useState<Blob | undefined>(undefined);

    // we need these additional flags, as the blobs are set from many different events
    // such as deleting, loading, new etc
    const [answerDirty, setAnswerDirty] = useState(false);
    const [questionDirty, setQuestionDirty] = useState(false);


    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        if (current) {
            /* this might cause multiple updates of the props which could be annoying */
            const questions = props.test.questions.map((question) => {
                if (question.id === current.id) {
                    return current;
                } else {
                    return question;
                }
            });
            props.setTest({ ...props.test, questions: questions });
            /* get the queued audio if it exists */
            setQueuedAudio();
        }
    }, [current]);

    useEffect(() => {
        // this will add any recorded audio the audio queue for this question
        updateAudioQueue();
    }, [answerBlob, questionBlob]);


    // whenever a recording "session" is ended, this fires
    useEffect(() => {
        if (questionDirty) {
            if (current && audioQueue.has(current.id)) {
                const item = audioQueue.get(current.id) as AudioQueueItem;
                if (item) {
                    item.questionDirty = true;
                }
            }
            setQuestionDirty(false);
        }
        if (answerDirty) {
            if (current && audioQueue.has(current.id)) {
                const item = audioQueue.get(current.id) as AudioQueueItem;
                if (item) {
                    item.answerDirty = true;
                }
            }
            //reset, is okay for circular loop as we have the if guard around it
            setAnswerDirty(false);
        }
    }, [questionDirty, answerDirty]);

    const init = () => {
        const execute = async () => {
            //nothing to really do here
        };
        execute();
    };

    const setQueuedAudio = () => {
        try {
            if (current) {
                if (audioQueue.has(current.id)) {
                    const item = audioQueue.get(current.id) as AudioQueueItem;
                    setQuestionBlob(item.questionBlob);
                    setAnswerBlob(item.answerBlob);
                } else {
                    //no audio queued for this question, null out and wait to record
                    setQuestionBlob(undefined);
                    setAnswerBlob(undefined);
                }
            } else {
                setQuestionBlob(undefined);
                setAnswerBlob(undefined);
            }
        } catch (err) {
            logSystemError(err, "Error in setQueuedAudio");
        }
    };

    const updateAudioQueue = () => {
        if (current) {
            if (audioQueue.has(current.id)) {
                const item = audioQueue.get(current.id) as AudioQueueItem;
                item.questionBlob = questionBlob;
                item.answerBlob = answerBlob;
            } else {
                const item = makeAudioQueueItem(current.id, questionBlob, answerBlob, undefined);
                audioQueue.set(current.id, item);
            }
        }
    };

    const handleChange = async (e: any) => {
        if (current) {
            await setCurrent({ ...current, title: e.target.value });
        }
    };

    const onNew = async (e: any) => {
        e.preventDefault();
        //setHaltEffects(true);
        const newQuestion = makeQuestion(props.test);
        props.setTest({ ...props.test, questions: [...props.test.questions, newQuestion] });
        await setCurrent(newQuestion);
        //setHaltEffects(false);
    };

    const remove = async (e: any) => {
        if (current) {
            //setHaltEffects(true);
            props.setTest(
                {
                    ...props.test,
                    questions: props.test.questions
                        .filter((question) => question.id !== current.id)
                });
            await setCurrent(undefined);
            //setHaltEffects(false);
        }
    };


    async function itemClicked(question: Question) {
        //setHaltEffects(true);
        await setCurrent(question);
        //setHaltEffects(false);
    }

    function onKeyDown(event: any) {
        event.preventDefault();
        /*        if (event.ctrlKey && event.key === 'a') {
                    if (currentQuestion != null) {
                        add(null);
                    }
                    onNew(null);
                }
                event.preventDefault();*/
    }


    const hasAudio = (question: Question, isForQuestionAudioFlag: boolean): boolean => {
        if (current !== undefined && question.id === current.id) {
            return isForQuestionAudioFlag ? questionBlob !== undefined : answerBlob !== undefined;
        } else {
            // no current entity therefore, check in the audio queue
            if (audioQueue.has(question.id)) {
                const item = audioQueue.get(question.id) as AudioQueueItem;
                return isForQuestionAudioFlag ? item.questionBlob !== undefined : item.answerBlob !== undefined;
            } else {
                return false;
            }
        }
    };

    const hasAnswerAudio = (question: Question): boolean => {
        return hasAudio(question, false);
    }
    const hasQuestionAudio = (question: Question): boolean => {
        return hasAudio(question, true);
    }


    const questionsDisplay =
        props.test.questions.map((question, index) => {

            //const [questionAudio, answerAudio] = questionAudioInQueue(question);
            return (

                <tr key={question.id} onClick={() => itemClicked(question)}>
                    <td>{index + 1}</td>
                    <td>{question.title}</td>
                    <td>{formatDateAndTime(new Date(question.createDate))}</td>
                    <td>{hasQuestionAudio(question) ? <HandThumbsUp /> : <HandThumbsDown />}{hasAnswerAudio(question) ? <HandThumbsUp /> : <HandThumbsDown />}</td>
                </tr>
            );
        }
        );


    questionRecorder.mediaRecorder.onstop = () => {
        const execute = async () => {
            const blob = await questionRecorder.audioToBlob();
            await setQuestionBlob(blob);
            await setQuestionDirty(true);
        };
        execute();
    };

    answerRecorder.mediaRecorder.onstop = () => {
        const execute = async () => {
            const blob = await answerRecorder.audioToBlob();
            await setAnswerBlob(blob);
            await setAnswerDirty(true);
        };
        execute();
    };


    return (
<>
      <hr/>
        <Container>
            <Row className="mb-3">
                <Col>Questions</Col>
                <Col>
                    <button onClick={onNew} title="New"><Plus /></button>
                    <button onClick={remove} title="Delete" disabled={current === undefined}><Trash /></button>
                    <button
                        onClick={() => AudioRecording.stopPlayback()}
                        title="Cancel Playback"
                        disabled={current === undefined}
                    >
                        <VolumeMute />
                    </button>
                </Col>
            </Row>


            <Row>
                <Col>
                    <Form.Group as={Row} className="mb-3" controlId="questionTitle">
                        <Form.Label column sm={2}>Title</Form.Label>
                        <Col sm={10}>
                            <Form.Control
                                placeholder="Enter the question title"
                                type="text"
                                name="questionTitle"
                                size="sm"
                                value={current ? current.title : ""}
                                onChange={handleChange}
                                autoFocus
                                disabled={current === undefined}
                            >
                            </Form.Control>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={2}>Question</Form.Label>
                        <Col sm={10}>
                            <AudioRecordingView
                                recorder={questionRecorder}
                                blob={questionBlob}
                                disabled={current === undefined}
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" >
                        <Form.Label column sm={2}>Answer</Form.Label>
                        <Col sm={10}>
                            <AudioRecordingView
                                recorder={answerRecorder}
                                blob={answerBlob}
                                disabled={current === undefined}
                            />
                        </Col>
                    </Form.Group>


                </Col>

                <Col>
                    <Table striped bordered hover variant="light">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Title</th>
                                <th>Added</th>
                                <th>Q A</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questionsDisplay}
                        </tbody>
                    </Table>

                </Col>

            </Row>

        </Container>
      </>
    )
}
