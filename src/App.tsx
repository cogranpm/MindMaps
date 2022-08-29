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
import { HtmlWorkout } from "./forms/workouts/html/htmlWorkout";
import { PreferenceEditor } from "./forms/mindMap/modals/preferences";
import { logMessage, logSystemError } from "./shared/errorHandling";

const workoutIndex = 2;
const mindMapIndex = 1;
const homeIndex = 0;

export const App = () => {
    const [nav, setNav] = useState(0);
    const [showPreferences, setShowPreferences] = useState(false);

    useEffect(() => {

    }, []);


    function onHome() {
        setNav(homeIndex);
    }

    function onList() {
        setNav(mindMapIndex);
    }

    function onWorkout() {
        setNav(workoutIndex);
    }

    function onPreferences() {
        setShowPreferences(true);
    }

    return (
        <>
            <Navbar bg="primary" variant="dark" expand="lg">
                <Container fluid>
                    <Navbar.Brand href="#home">Parinherm Mind Maps</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link onClick={onHome}>Home</Nav.Link>
                            <Nav.Link onClick={onList}>Mind Maps</Nav.Link>
                            <Nav.Link onClick={onWorkout}>Workouts</Nav.Link>
                            <Nav.Link onClick={onPreferences}>Preferences</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container fluid>
                {nav === homeIndex ? (
                    <div>
                        <img src="./public/home.png" alt="home" />
                    </div>
                ) : (
                    ""
                )}
                {nav === mindMapIndex ? <MindMapView /> : ""}
                {nav === workoutIndex ? <HtmlWorkout /> : ""}
            </Container>
            {showPreferences ? <PreferenceEditor setClose={setShowPreferences} /> : ""}
        </>
    );
};
