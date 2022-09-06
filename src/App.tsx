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
import jewels from "./public/jewels.jpg";


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

    function onPreferences() {
        setShowPreferences(true);
    }

    return (
        <>
            <Navbar bg="primary" variant="dark" expand="lg">
                <Container fluid>
                    <Navbar.Brand href="#home"
                        style={{
                          fontFamily: "'IBM Plex Mono', san serif",
                          fontWeight: "bold"
                        }}>Thought Catcher</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link onClick={onHome}>Home</Nav.Link>
                            <Nav.Link onClick={onList}>Mind Maps</Nav.Link>
                            <Nav.Link onClick={onPreferences}>Preferences</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container fluid>
                {nav === homeIndex ? (
                    <div style={{ display: "flex",
                                  marginTop: "80px",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  height: "100%" }} >
                      <div style={{alignSelf: "flex-end"}}>
                            <img src={jewels} />
                        </div>
                    </div>
                ) : (
                    ""
                )}
                {nav === mindMapIndex ? <MindMapView /> : ""}
            </Container>
            {showPreferences ? <PreferenceEditor setClose={setShowPreferences} /> : ""}
        </>
    );
};
