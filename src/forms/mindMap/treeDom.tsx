import React, { useContext, useLayoutEffect } from "react";
import { TrunkDom } from "./trunkDom";
import { LeafDom } from "./leafDom";
import { FETCH_ID_TREEPERSIST, XOrientation } from "../../shared/constants";
import { AppContext } from "../models/mindMaps/context";
import { Branch, Leaf, MindMap, TabItem } from "../models/mindMaps/state";
//import { TitleEditor } from "./modals/titleEdit";
import { getMindMapFromCache } from "../models/mindMaps/factories";
import { logMessage, logSystemError } from "../../shared/errorHandling";
//import { ContextMenu } from "./elements/contextMenu";
import { persist } from "~src/shared/workerClient";
import { Row, Col, Container } from "react-bootstrap";

import { BranchDom } from "./branchDom";
import { addBranch } from "../models/mindMaps/modelHandlers";
import { LeafEditor } from "./modals/leafEdit";
import { LeafViewer } from "./modals/leafView";
import { TestRunEditor } from "./modals/testRun/testRun";
import { ActionType } from "../models/mindMaps/actions";
import { Content } from "~src/shared/workerMessages";


type TreeProps = {
	children?: React.ReactNode;
	tabItem: TabItem;
	handleTitleSave: (e: string) => void;
};

export const TreeDom = (props: TreeProps) => {

	const { state, dispatch } = useContext(AppContext);
	const mindMap = getMindMapFromCache(state) as MindMap;

	useLayoutEffect(() => {
		try {
			if (mindMap && mindMap.branches && mindMap.branches.length > 0) {
				const firstBranchElement = document.getElementById(mindMap.branches[0].id);
				if (firstBranchElement) {
					firstBranchElement.focus();
				}
			}
		} catch (e: any) {
			logSystemError(e, "Error in the layout effect of TreeDOM");
		}
	}, []);


	const leftBranches = (mindMap !== undefined)
		? mindMap.branches
			.filter((branch: Branch) => branch.orientation === XOrientation.Left)
		: [];

	const rightBranches = (mindMap !== undefined)
		? mindMap.branches
			.filter((branch: Branch) => branch.orientation === XOrientation.Right)
		: [];


	const onAddBranch = async (orientation: XOrientation) => {
		addBranch(mindMap, orientation, dispatch);
	};

	const onClickPane = async (e: any, orientation: XOrientation) => {
		addBranch(mindMap, orientation, dispatch);
	};

	const makeBranch = (branch: Branch) => {
		return (
			<div>
				<BranchDom branch={branch} handleSave={save} />
				<Container fluid>
					<Row>
						{
							branch.leaves.map((leaf: Leaf) =>
								<Col key={leaf.id}>
									<LeafDom leaf={leaf} branch={branch} handleSave={save} />
								</Col>
							)
						}
					</Row>
				</Container>
				<div style={{ marginBottom: "20px" }} />
			</div>
		);
	};

	const handleClose = () => {
		dispatch({
			type: ActionType.HideTitleEditor,
			payload: { updatedEntity: mindMap },
		});


	};

	const handleSave = async (e: string) => {
		if (state.activeEntity !== null) {
			state.activeEntity.title = e;
		}
		save();
	};

	const save = async () => {
		persist(FETCH_ID_TREEPERSIST, mindMap, saveCallback);
	};

	const saveCallback = (e: Content) => {
		const updatedMindMap = e as MindMap;
		dispatch({
			type: ActionType.HideTitleEditor,
			payload: { updatedEntity: updatedMindMap },
		});
		if (state.activeEntity) {
			dispatch({ type: ActionType.FocusElement, payload: { id: state.activeEntity.id } });
		}
	};

	return (
		<Row style={{ height: "100%" }}>
			<Col style={{
				cursor: "hand",
			}}
				onClick={(e) => onClickPane(e, XOrientation.Left)}>
				{leftBranches.map(makeBranch)}
			</Col>
			<Col xs lg="1">
				<TrunkDom mindMap={mindMap} onAddBranch={onAddBranch} handleTitleSave={props.handleTitleSave} />
			</Col>
			<Col style={{ cursor: "hand" }} onClick={(e) => onClickPane(e, XOrientation.Right)}>
				{rightBranches.map(makeBranch)}
			</Col>
			{state.showLeafEditor ? (
				<LeafEditor leaf={state.activeEntity as Leaf} />
			) : state.showLeafViewer ? (
				<LeafViewer leaf={state.activeEntity as Leaf} />
			) : state.showTestRunEditor ? (
				<TestRunEditor leaf={state.activeEntity as Leaf} />
			) : (
				""
			)}
		</Row>
	);
}
