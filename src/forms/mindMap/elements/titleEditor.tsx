import React from "react";
import EdiText from "react-editext";
import { ENTER_KEY, ShapeType } from "~src/shared/constants";


export interface TitleEditorProps {
	handleSave: (e: string) => void;
	title: string;
	shapeType: ShapeType;
}

const titleEditorInput = "titleEditorInput";

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
			startEditingOnFocus={false}
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
				id: "titleEditorInput",
				style: {
					fontFamily: "'Roboto', san serif",
					fontSize: "9pt"
				},
				onKeyPress: (e: any) => e.stopPropagation(),
				onKeyDown: (e: any) => e.stopPropagation(),
				onFocus: (e: any) => {
					try {
						e.target.select()
					} catch (e) { }
				}
			}}
			viewProps={{
				style: {
					alignSelf: "center",
					fontFamily: "'Roboto', san serif",
					fontSize: "9pt",
					color: "#000000",
					width: "fit-content -moz-fit-content",
				},
				onKeyDown: (e: any) => {
					if (e.key === ENTER_KEY) {
						e.stopPropagation();
					}
				},
			}}
		/>

	);
};

/*
			onEditingStart={(v) => {
				setTimeout(() => {
					try {
						const editor = document.getElementById(titleEditorInput);
						if (editor) {
							const textEditor = editor as HTMLInputElement;
							textEditor.select();
						}
					} catch(e){
						
					}
					
				}, 50);
			}}
*/
