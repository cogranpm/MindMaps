import React, { useState, useEffect } from "react";
import {
	Container,
	Row,
	Col,
	Navbar,
	Nav,
	NavDropdown,
	ButtonGroup,
	Button,
} from "react-bootstrap";
import { MindMapView } from "./forms/mindMap/mindMap";
import { PreferenceEditor } from "./forms/mindMap/modals/preferences";
import { logMessage, logSystemError } from "./shared/errorHandling";
//import jewels from "./public/jewels.jpg";
import orientalPath from "./public/images/oriental-path-medium.png";
import { ArrowRepeat } from 'react-bootstrap-icons';
import { AppContext } from './forms/models/mindMaps/context';
import { SyncDialog } from './forms/mindMap/modals/syncDialog';


//const workoutIndex = 2;
const mindMapIndex = 1;
const homeIndex = 0;

export const App = () => {
	const [nav, setNav] = useState(0);
	const [showPreferences, setShowPreferences] = useState(false);
	const [showSyncDialog, setShowSyncDialog] = useState(false);


	useEffect(() => {

	}, []);


	function onHome() {
		setNav(homeIndex);
	}

	function onList() {
		setNav(mindMapIndex);
	}

	function onPreferences() {
		setShowPreferences(true);
	}

	const onClickSync = () => {
		setShowSyncDialog(true);
	}

	return (
		<>
			<Navbar bg="success" variant="dark" expand="lg">
				<Container fluid>
					<Navbar.Brand href="#home"
						style={{
							fontFamily: "'IBM Plex Mono', san serif",
							fontWeight: "bold"
						}}>
						Komorebi
					</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="me-auto">
							<Nav.Link onClick={onHome}>Home</Nav.Link>
							<Nav.Link onClick={onList}>Enter</Nav.Link>
							<Nav.Link onClick={onPreferences}>Preferences</Nav.Link>
							<Nav.Item title="sync"><Button variant="success" onClick={onClickSync}><ArrowRepeat aria-label="Sync" /></Button></Nav.Item>
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>
			<Container fluid>
				{nav === homeIndex ? (
					<div style={{
						display: "flex",
						marginTop: "80px",
						justifyContent: "center",
						alignItems: "center",
						height: "100%"
					}} >
						<div style={{ alignSelf: "flex-end" }}>
							<img src={orientalPath} />
							<div>
								Imagine you are walking along a path through the forest. Your thoughts, ideas and musings appear as trees
								either side of you. You can record your voice and listen to it. Your memory is illuminated by the marks you
								have made on the branches of the trees.

							</div>
							<div>
								Please <a href="#" onClick={onList}>Enter</a>
							</div>
						</div>

					</div>
				) : (
					""
				)}
				{nav === mindMapIndex ? <MindMapView /> : ""}
			</Container>
			{showPreferences ? <PreferenceEditor setClose={setShowPreferences} /> : ""}
			{showSyncDialog ? <SyncDialog setShow={setShowSyncDialog} /> : ""}
		</>
	);
};
