import React from "react";
import EdiText from "react-editext";
import { ShapeType } from "~src/shared/constants";


export interface TitleEditorProps {
    handleSave: (e: string) => void;
    title: string;
    shapeType: ShapeType;
}

export const TitleEditor = (props: TitleEditorProps) => {

    return (
        <EdiText
            type="text"
            value={props.title}
            onSave={props.handleSave}
            data-shape-type={props.shapeType}
            tabIndex={0}
            editing={false}
            editOnViewClick={false}
            submitOnEnter={true}
            submitOnUnfocus={true}
            cancelOnEscape={true}
            startEditingOnEnter={true}
            showButtonsOnHover={true}
            buttonsAlign="after"
            editButtonProps={{
                style: {
                    border: "none"
                }
            }}
            containerProps={{
                style: {
                    margin: "0 2px 0 2px",
                    padding: "0 0 0 4px",
                    width: "fit-content -moz-fit-content",
                    display: "flex",
                    flexDirection: "column",
                }
            }}
            inputProps={{
                style: {
                    fontFamily: "'Roboto', san serif",
                    fontSize: "9pt"
                },
                onKeyPress: (e: any) => e.stopPropagation(),
                onKeyDown: (e: any) => e.stopPropagation()
            }}
            viewProps={{
                style: {
                    alignSelf: "center",
                    fontFamily: "'Roboto', san serif",
                    fontSize: "9pt",
                    color: "#000000",
                    width: "fit-content -moz-fit-content",
                },
            }}
        />

    );
};
