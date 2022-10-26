import React, { useContext } from "react";
import { TitleEditor } from "./elements/titleEditor";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { ClipboardCheck, Eye, FolderSymlink, Link, PencilSquare } from "react-bootstrap-icons";
import { BUTTON_VARIANT, DELETE_KEY, ENTER_KEY, FETCH_ID_GETMINDMAPBYLEAF, ShapeType } from "~src/shared/constants";
import { find } from "~src/shared/workerClient";
import { Content } from "~src/shared/workerMessages";
import { ActionType } from "../models/mindMaps/actions";
import { AppContext } from "../models/mindMaps/context";
import { getMindMapFromCache } from "../models/mindMaps/factories";
import { removeLeaf } from "../models/mindMaps/modelHandlers";
import { Branch, Leaf, LeafType, MindMap } from "../models/mindMaps/state";
import { background, border, boxShadow, font, padding } from "./domStyles";

export interface LeafDomProps {
	leaf: Leaf;
	branch: Branch;
	handleSave: () => void;
}

export const LeafDom = (props: LeafDomProps) => {

	const { state, dispatch } = useContext(AppContext);
	const mindMap = getMindMapFromCache(state) as MindMap;

	const handleLeafKeyPress = async (e: React.KeyboardEvent, leaf: Leaf) => {
		if (e.key === DELETE_KEY) {
			removeLeaf(dispatch, mindMap, leaf);
		}
	};

	/*
	  const handleLeafTitleKeyPress = (e: React.KeyboardEvent, leaf: Leaf) => {
		e.stopPropagation();
		  if (e.key === ENTER_KEY) {
			  dispatch({ type: ActionType.ShowTitleEditor, payload: { entity: leaf } });
		  }
	  };
	*/

	const handleEditClick = (leaf: Leaf) => {
		dispatch({ type: ActionType.ShowLeafEditor, payload: { leaf: leaf } });
	};

	const handleViewClick = (leaf: Leaf) => {
		dispatch({ type: ActionType.ShowLeafViewer, payload: { leaf: leaf } });
	};

	const handleLink = (leaf: Leaf) => {
		window.open(leaf.url);
	};

	const handleTest = (leaf: Leaf) => {
		dispatch({ type: ActionType.ShowTestRunEditor, payload: { leaf: leaf } });
	};

	const handleMindMap = async (leaf: Leaf) => {
		find(
			FETCH_ID_GETMINDMAPBYLEAF,
			{
				selector: { leafId: leaf.id },
			},
			loadMindMapCallback
		);
	};

	const loadMindMapCallback = (e: Content) => {
		const response = e as PouchDB.Find.FindResponse<Content>;
		if (response) {
			if (response.docs.length > 0) {
				dispatch({
					type: ActionType.OpenTab,
					payload: { entity: response.docs[0] as MindMap },
				});
			}
		}
	};

	const handleTitleSave = async (e: string) => {
		props.leaf.title = e;
		props.handleSave();
	}


	return (
		<div
			onClick={(e) => {
				// so that the parent pane doesn't fire
				e.preventDefault();
				e.stopPropagation();
			}}
		>
			<div
				style={{
					...{ width: "5px", height: "20px", border: "1px solid black", marginLeft: "20px" },
					...background
				}} />

			<div
				id={props.leaf.id}
				tabIndex={0}
				data-shape-type={ShapeType.Leaf}
				data-branch-id={props.branch.id}
				onKeyDown={(e: React.KeyboardEvent) => handleLeafKeyPress(e, props.leaf)}
				style={{
					...{ minWidth: "160px", maxWidth: "220px" },
					...border,
					...background,
					...padding,
					...font,
					...boxShadow
				}}>
				{/*
                  <p
                  style={{ cursor: "hand" }}
                  tabIndex={0}
                  onKeyDown={(e: React.KeyboardEvent) =>
                  handleLeafTitleKeyPress(e, props.leaf)
                  }
                  data-shape-type={ShapeType.LeafTitle}
                  data-leaf-id={props.leaf.id}
                  >
                  {props.leaf.title}
                  </p>

              */}
				<TitleEditor title={props.leaf.title} handleSave={handleTitleSave} shapeType={ShapeType.LeafTitle} />
				<div style={{ border: "1px solid white", width: "fit-content" }}>
					<Button
						variant={BUTTON_VARIANT}
						onClick={() => handleViewClick(props.leaf)}
					>
						<Eye />
					</Button>
					<Button
						variant={BUTTON_VARIANT}
						onClick={() => handleEditClick(props.leaf)}
					>
						<PencilSquare />
					</Button>
					{props.leaf.type === LeafType.Link ? (
						<Button
							variant={BUTTON_VARIANT}
							onClick={() => handleLink(props.leaf)}
						>
							<Link />
						</Button>
					) : (
						""
					)}
					{props.leaf.type === LeafType.MindMap ? (
						<Button
							variant={BUTTON_VARIANT}
							onClick={() => handleMindMap(props.leaf)}
						>
							<FolderSymlink />
						</Button>
					) : (
						""
					)}
					{props.leaf.type === LeafType.Test ? (
						<OverlayTrigger
							overlay={<Tooltip id={props.leaf.id + "_testRuns"}>Test Runs</Tooltip>}
						>
							<Button
								variant={BUTTON_VARIANT}
								onClick={() => handleTest(props.leaf)}
							>
								<ClipboardCheck />
							</Button>
						</OverlayTrigger>
					) : (
						""
					)}

				</div>
			</div>
		</div>

	);
}
