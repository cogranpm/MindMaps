import React, { useState, useEffect } from 'react';
import 'ace-builds';
import AceEditor from "react-ace";
//import 'ace-builds/webpack-resolver';
//import ace from 'ace-builds/src-noconflict/ace';
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/theme-eclipse";
import "ace-builds/src-noconflict/theme-chrome";
import "ace-builds/src-noconflict/theme-gob";
import "ace-builds/src-noconflict/theme-gruvbox";
import "ace-builds/src-noconflict/theme-idle_fingers";
import "ace-builds/src-noconflict/theme-chaos";
import "ace-builds/src-noconflict/theme-ambiance";
import "ace-builds/src-noconflict/theme-clouds";
import "ace-builds/src-noconflict/theme-cobalt";
import "ace-builds/src-noconflict/theme-crimson_editor";
import "ace-builds/src-noconflict/theme-dawn";
import "ace-builds/src-noconflict/theme-dreamweaver";
import "ace-builds/src-noconflict/theme-iplastic";
import "ace-builds/src-noconflict/theme-katzenmilch";
import "ace-builds/src-noconflict/theme-kr_theme";
import "ace-builds/src-noconflict/theme-terminal";

import 'ace-builds/src-noconflict/mode-c_cpp'

import "ace-builds/src-noconflict/ext-language_tools";
import * as vim from "ace-builds/src-noconflict/keybinding-vim";
import * as emacs from "ace-builds/src-noconflict/keybinding-emacs";
import * as vscode from "ace-builds/src-noconflict/keybinding-vscode";
import * as sublime from "ace-builds/src-noconflict/keybinding-sublime";


//import { Ace } from 'ace-builds';
import { getPreference, PREFERENCE_EDITOR_KEYBINDING, PREFERENCE_EDITOR_THEME } from '../../../shared/preferences';
import { logMessage } from '../../../shared/errorHandling';


interface AceEditorProps {
    height: string;
    focus: boolean;
    readOnly: boolean;
    snippet: string;
    defaultValue: string;
    mode: string;
    name: string;
    showGutter: boolean;
    onChange: (value: string) => void;
    tabIndex: number;
    writeHandler: () => void;
}

export function AceWrapper(props: AceEditorProps) {

    const { height = "175px" } = props;
    const { focus = true } = props;
    const { readOnly = false } = props;
    const { snippet = "" } = props;
    const { defaultValue = "" } = props;

    const [editorKeyBinding, setEditorKeyBinding] = useState("vim");
    const [editorTheme, setEditorTheme] = useState("eclipse");

    useEffect(() => {
        const keyBinding = getPreference(PREFERENCE_EDITOR_KEYBINDING);
        //logMessage(`KeyBinding: ${keyBinding}`);
        setEditorKeyBinding(keyBinding);
        setEditorTheme(getPreference(PREFERENCE_EDITOR_THEME));
    }, []);

    function editorLoad(instance: any) {
        /* need stop propagation of certain keys due to our upper level handling
          ie o key adds a branch etc
        */
        if (instance && instance.textInput) {
            vim.Vim.map("fd", "<Esc>", "insert");
            const inputter = instance.textInput.getElement();
            if (inputter) {
                inputter.onkeydown = (e: any) => {
                    e.stopPropagation();
                };
            }

            vim.Vim.defineEx('write', 'w', function () {
                props.writeHandler();
            });
        }
    }

    return (
        <AceEditor
            mode={props.mode}
            theme={editorTheme}
            name={props.name}
            keyboardHandler={editorKeyBinding}
            defaultValue={props.defaultValue}
            value={props.snippet}
            onChange={props.onChange}
            onLoad={editorLoad}
            height={props.height}
            width="100%"
            focus={props.focus}
            readOnly={props.readOnly}
            showGutter={props.showGutter}
            editorProps={{ $blockScrolling: true }}
            setOptions={{
                useWorker: false,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
            }}
            style={{ border: "1px solid rgba(0,0,0,.2)" }}
        />

    );
}
