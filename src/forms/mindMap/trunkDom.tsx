import React from "react";
import { TitleEditor } from "./elements/titleEditor";
import { ShapeType, XOrientation } from "~src/shared/constants";
import { MindMap } from "../models/mindMaps/state";
import {
	ArrowBarLeft,
	ArrowBarRight,
} from "react-bootstrap-icons";
import { Button } from "react-bootstrap";

const border = { border: "1px solid black", borderRadius: "10px" };
const background = { backgroundColor: "#e7eaed" };
const padding = { padding: "4px 4px 4px 4px" };
const font = {
	fontFamily: "'Roboto', san serif",
	fontSize: "9pt",
	fontWeight: "lighter",
};
const boxShadow = { boxShadow: "5px 10px #888888" };



export interface TrunkDomProps {
	mindMap?: MindMap;
	onAddBranch: (orientation: XOrientation) => void;
	handleTitleSave: (e: string) => void;
}

interface BranchButtonProps{
	onAddBranch: (orientation: XOrientation) => void;
}

const BranchButtons = (props: BranchButtonProps) => {
	
	return (
	<div style={{ ...{height: "100%"}, ...font}}>
		<p><small>Add Branch</small></p>
		<Button
			title="Add Branch"
			onClick={() =>
				props.onAddBranch(XOrientation.Left)
			}
			tabIndex={-1}
			size="sm"
			variant="secondary"
		>
			<ArrowBarLeft size={16} arial-label="Add Branch" />
		</Button>

		<span style={{ padding: "2px", width: "5px" }} ></span>

		<Button
			title="Add Branch"
			onClick={() =>
				props.onAddBranch(XOrientation.Right)
			}
			tabIndex={-1}
			size="sm"
			variant="secondary"
		>
			<ArrowBarRight size={16} arial-label="Add Branch" />
		</Button>
	</div>
	);
}

export const TrunkDom = (props: TrunkDomProps) => {

	const handleTitleSave = async (e: string) => {
		props.handleTitleSave(e);
	};

	return (
		<div
			tabIndex={0}
			data-shape-type={ShapeType.Trunk}
			style={
				{
					...{
						height: "100%",
						textAlign: "center"
					},
					...padding,
					...border,
					...background,
					...boxShadow
				}}>
			{props.mindMap ?
				<>
				<div style={{ height: "auto", marginBottom: "10px" }}>
					{props.mindMap.name}
				</div>
				<BranchButtons onAddBranch={props.onAddBranch}/>
				</>
				: ""}
		</div>

	)
}
