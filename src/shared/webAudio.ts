//import { MediaRecorder } from 'media'

import { logSystemError } from "./errorHandling";

export class AudioRecording {
    mediaRecorder!: MediaRecorder;
    private buffer: Blob[];
    //private blob = null;
    private static playbackAudio?: HTMLAudioElement;
    private readonly codec: string = 'audio/ogg; codecs=opus';

    constructor() {
        this.buffer = new Array<Blob>();
        AudioRecording.playbackAudio = undefined;
        try {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                this.mediaRecorder = new MediaRecorder(stream);
                if (this.mediaRecorder !== null) {
                    const boundOnData = this.onDataAvailable.bind(this);
                    this.mediaRecorder.ondataavailable = boundOnData;
                }
            });
        } catch (e) {
            logSystemError(e, "Error in AudioRecording constructor");
        }
    }

    onDataAvailable(e: BlobEvent) {
        this.buffer.push(e.data);
    }

    start(): void {
        this.buffer = new Array<Blob>();
        this.mediaRecorder.start();
    }

    stop(): void {
        this.mediaRecorder.stop();
    }

    pause() {
        this.mediaRecorder.pause();
    }

    resume() {
        this.mediaRecorder.resume();
    }

    hasAudio() {
        return !this.buffer.length;
    }

    audioToBlob() {
        //const blob = new Blob(this.#buffer, { 'type': 'audio/wav; codecs=MS-PCM' });
        return new Blob(this.buffer, { 'type': this.codec });
    }

    static stopPlayback() {
        if (AudioRecording.playbackAudio) {
            AudioRecording.playbackAudio.pause();
        }
    }

    static playAudioBlob(audioBlob: Blob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        AudioRecording.playbackAudio = undefined;
        audio.onended = (e) => AudioRecording.playbackAudio = undefined;
        /*
        audio.addEventListener('loadeddata', () => {
            let duration = audio.duration;
            console.log(`Duration: ${duration}`);
        });
        */
        audio.play().then(() => {
            AudioRecording.playbackAudio = audio;
        });
    }

}

