/*
 * using the reducer in App Context pattern for global state and reducer
 * https://dev.to/hellomuthu23/how-to-use-usereducer-and-usecontext-hooks-with-typescript-in-react-14d1
 *
 */

import React, { useEffect, useReducer, useState } from "react";
import { List } from "./list";
import { Tree } from "./tree";
import { TreeDom } from "./treeDom";
import { Container, Row, Col, Tabs, Tab, CloseButton, Nav } from "react-bootstrap";

import { appReducer } from "../models/mindMaps/reducer";
import { initialAppState, MindMap, TabItem } from "../models/mindMaps/state";
import { AppContext } from "../models/mindMaps/context";
import { House } from "react-bootstrap-icons";
import EdiText from "react-editext";
import { ActionType } from "../models/mindMaps/actions";
import { getMindMapFromCache } from "../models/mindMaps/factories";
import { logMessage, logSystemError } from "../../shared/errorHandling";
import { Content } from "~src/shared/workerMessages";
import { persist } from "~src/shared/workerClient";
import { FETCH_ID_PUTMINDMAP, XOrientation } from "~src/shared/constants";
import { onKeyPress } from "../../shared/keyboardFunctions";
import { addBranch } from "../models/mindMaps/modelHandlers";
import { ContextMenu } from "./elements/contextMenu";

export function MindMapView() {
    const [state, dispatch] = useReducer(appReducer, initialAppState);
    const mindMap = getMindMapFromCache(state);

    const [tabClosed, setTabClosed] = useState(false);

    /*
      useEffect(() => {
          logMessage("map just rendered");
      });
    */

    useEffect(() => {
        if (tabClosed) {
            if (state.tabs.length === 0) {
                dispatch({ type: ActionType.SwitchTab, payload: { tabId: "home" } });
            } else {
                const lastTab = state.tabs[state.tabs.length - 1].mindMap._id
                dispatch({ type: ActionType.SwitchTab, payload: { tabId: lastTab } });
            }
            setTabClosed(false);
        }
    }, [tabClosed]);

    const handleSave = async (e: string) => {
        try {
            const mindMap = getMindMapFromCache(state);
            if (mindMap !== undefined) {
                mindMap.name = e;
                persist(FETCH_ID_PUTMINDMAP, mindMap, saveCallback);
            }
        } catch (err) {
            logSystemError(err, "Error saving mind map");
        }
    };

    const saveCallback = (e: Content) => {
        const updatedMindMap = e as MindMap;
        dispatch({
            type: ActionType.EditMindMap,
            payload: { updatedEntity: updatedMindMap },
        });
    };

    const handleSelect = (e: string | null) => {
        if (e !== null) {
            dispatch({ type: ActionType.SwitchTab, payload: { tabId: e } });
        }
    };

    const handleCloseTab = async (tabItem: TabItem) => {
        dispatch({ type: ActionType.CloseTab, payload: { tabItem: tabItem } });
        setTabClosed(true)
    };


    const addBranchHandler = async (map: MindMap, orientation: XOrientation) => {
        addBranch(map, orientation, dispatch);
    };


    return (
        <AppContext.Provider value={{ state, dispatch }}>

            <Tabs
              id="groveTabs"
                activeKey={state.activeTabId}
              className="mb-3"
              onSelect={handleSelect}
            >
                <Tab eventKey="home" key={"home"} title={<House />}>
                    <div>
                        <Container fluid>
                            <Row>
                                <Col>
                                    <List />
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </Tab>
                {state.tabs.map((tabItem: TabItem) => {
                    return (
                        <Tab
                            key={tabItem.mindMap._id}
                            eventKey={tabItem.mindMap._id}
                            title={
                                <Container>
                                    <Row>
                                        <Col>
                                            <EdiText
                                                type="text"
                                                value={tabItem.mindMap.name}
                                                onSave={handleSave}
                                                tabIndex={0}
                                                editing={false}
                                                editOnViewClick={false}
                                                submitOnEnter={true}
                                                submitOnUnfocus={true}
                                                cancelOnEscape={true}
                                                startEditingOnEnter={true}
                                                showButtonsOnHover={true}
                                                buttonsAlign="after"
                                                containerProps={{
                                                    style: {
                                                    }
                                                }}
                                                inputProps={{
                                                    style: {
                                                        width: "260px",
                                                        fontFamily: "'Roboto', san serif",
                                                        fontSize: "9pt"
                                                    },

                                                }}
                                                editButtonProps={{
                                                    style: {
                                                        height: "40px",
                                                        width: "50px",
                                                        borderRadius: "5px",
                                                        padding: "0"
                                                    }
                                                }}
                                                viewProps={{
                                                    style: {
                                                        margin: "0",
                                                        padding: "0",
                                                        fontFamily: "'Roboto', san serif",
                                                        fontSize: "9pt",
                                                        color: "#000000",
                                                        minWidth: "130px",
                                                        maxWidth: "200px",
                                                        width: "auto"
                                                    },
                                                }}
                                            />
                                        </Col>
                                        <Col>
                                            <CloseButton
                                                aria-label="Close Tab"
                                                onClick={() => handleCloseTab(tabItem)}
                                            />
                                        </Col>
                                    </Row>
                                </Container>
                            }
                        >
                            <Container fluid>
                                <Row>
                                    <Col onKeyDown={(e) => onKeyPress(e, mindMap, addBranchHandler)}>
                                        <TreeDom tabItem={tabItem} />
                                        {mindMap ? <ContextMenu map={mindMap} dispatch={dispatch}></ContextMenu> : ""}

                                    </Col>
                                </Row>
                            </Container>
                        </Tab>
                    );
                })}
            </Tabs>


          {/*
            <Nav
              variant="tabs"
              id="groveTabs"
              activeKey={state.activeTabId}
              className="mb-3"
              onSelect={handleSelect}
            >
                <Nav.Item eventKey="home" key={"home"} title={<House />}>
                    <div>
                        <Container fluid>
                            <Row>
                                <Col>
                                    <List />
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </Nav.Item>
                {state.tabs.map((tabItem: TabItem) => {
                    return (
                        <Nav.Item
                            key={tabItem.mindMap._id}
                            eventKey={tabItem.mindMap._id}
                            title={
                                <Container>
                                    <Row>
                                        <Col>
                                            <EdiText
                                                type="text"
                                                value={tabItem.mindMap.name}
                                                onSave={handleSave}
                                                tabIndex={0}
                                                editing={false}
                                                editOnViewClick={false}
                                                submitOnEnter={true}
                                                submitOnUnfocus={true}
                                                cancelOnEscape={true}
                                                startEditingOnEnter={true}
                                                showButtonsOnHover={true}
                                                buttonsAlign="after"
                                                containerProps={{
                                                    style: {
                                                    }
                                                }}
                                                inputProps={{
                                                    style: {
                                                        width: "260px",
                                                        fontFamily: "'Roboto', san serif",
                                                        fontSize: "9pt"
                                                    },

                                                }}
                                                editButtonProps={{
                                                    style: {
                                                        height: "40px",
                                                        width: "50px",
                                                        borderRadius: "5px",
                                                        padding: "0"
                                                    }
                                                }}
                                                viewProps={{
                                                    style: {
                                                        margin: "0",
                                                        padding: "0",
                                                        fontFamily: "'Roboto', san serif",
                                                        fontSize: "9pt",
                                                        color: "#000000",
                                                        minWidth: "130px",
                                                        maxWidth: "200px",
                                                        width: "auto"
                                                    },
                                                }}
                                            />
                                        </Col>
                                        <Col>
                                            <CloseButton
                                                aria-label="Close Tab"
                                                onClick={() => handleCloseTab(tabItem)}
                                            />
                                        </Col>
                                    </Row>
                                </Container>
                            }
                        >
                            <Container fluid>
                                <Row>
                                    <Col onKeyDown={(e) => onKeyPress(e, mindMap, addBranchHandler)}>

                                        <TreeDom tabItem={tabItem} />
                                        {mindMap ? <ContextMenu map={mindMap} dispatch={dispatch}></ContextMenu> : ""}

                                    </Col>
                                </Row>
                            </Container>
                        </Nav.Item>
                    );
                })}
            </Nav>


            */}
        </AppContext.Provider>
    );
}
