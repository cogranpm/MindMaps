import React, { useEffect } from 'react';
import { AudioRecording } from '../../../shared/webAudio';
import { Button, ButtonGroup } from 'react-bootstrap';
import { Record, Pause, PlayBtn, Stop, Play } from 'react-bootstrap-icons';
import { BUTTON_VARIANT } from '~src/shared/constants';

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
      try{
        e.preventDefault();
        props.recorder.pause();
      } catch (e){

      }

    };

    const resume = async (e: any) => {
      try{
        e.preventDefault();
        props.recorder.resume();
      } catch(e){

      }

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
            <Button title="Record" onClick={record} variant="success" disabled={props.disabled}>
                <Record />
            </Button>

            <Button title="Pause" onClick={pause} variant="info" disabled={props.disabled}>
                <Pause />
            </Button>

            <Button title="Resume" onClick={resume} variant="info" disabled={props.disabled}>
                <PlayBtn />
            </Button>

            <Button title="Stop" onClick={stop}  variant="danger" disabled={props.disabled}>
                <Stop />
            </Button>

         {props.blob ? <Button title="Play" onClick={play} variant="primary"><Play/></Button> : ""}
        </ButtonGroup>
    );
}
