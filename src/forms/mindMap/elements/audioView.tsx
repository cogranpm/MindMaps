import React, { useEffect } from 'react';
import { AudioRecording } from '../../../shared/webAudio';
import { Button, ButtonGroup } from 'react-bootstrap';
import { Record, Pause, PauseFill, Stop } from 'react-bootstrap-icons';

export interface AudioRecordingViewProps {
    disabled: boolean;
    recorder: {
        start: () => void,
        stop: () => void,
        resume: () => void,
        pause: () => void
    };
    blob: Blob | undefined;
}

export function AudioRecordingView(props: AudioRecordingViewProps) {

    //const buttonStyle = "outline-secondary";

    useEffect(() => {

        return function cleanup() {
        };
    }, []);

    const record = (e: any) => {
        e.preventDefault();
        props.recorder.start();
    };

    const stop = async (e: any) => {
        e.preventDefault();
        props.recorder.stop();
    };
    const pause = async (e: any) => {
        e.preventDefault();
        props.recorder.pause();
    };
    const resume = async (e: any) => {
        e.preventDefault();
        props.recorder.resume();
    };

    const play = async (e: any) => {
        e.preventDefault();
        if (props.blob) {
            AudioRecording.playAudioBlob(props.blob);
        }
    };


    return (
        <ButtonGroup
            aria-label="Recording Buttons"
            className="mb-2"
        >
            <Button onClick={record} disabled={props.disabled}>
                <Record />
            </Button>

            <Button onClick={pause} disabled={props.disabled}>
                <Pause />
            </Button>

            <Button onClick={resume} disabled={props.disabled}>
                <PauseFill />
            </Button>

            <Button onClick={stop} disabled={props.disabled}>
                <Stop />
            </Button>

         {props.blob ? <Button onClick={play}>Play</Button> : ""} 
        </ButtonGroup>
    );
}

