import React, { useState, useEffect, ReactElement } from "react";
import { ListGroup, Col } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { HtmlElement } from "~src/forms/models/workouts/htmlElement";
import { uniqueId } from "~src/shared/uuid";
import { BuilderBar } from "./builderBar";
import { ElementPicker } from "./elementPicker";

type HtmlListProps = {
    currentElement: HtmlElement;
    parent: HtmlElement | undefined;
    setCurrentElement: React.Dispatch<React.SetStateAction<HtmlElement | undefined>>;
};

export const HtmlList = (props: HtmlListProps) => {

    const [showPicker, setShowPicker] = useState(false);
    const [selectedElement, setSelectedElement] = useState<HtmlElement | undefined>(undefined);

    useEffect(() => {
        console.log("loading a list group");
    }, []);

    useEffect(() => {
        console.log("render a list group");
    });

    const printElement = (element: HtmlElement, msg: string) => {
        console.log(msg + element.type + " " + element.id);
    };

    /*
      const updateElementArray = (element: HtmlElement, updatedChild: HtmlElement) => {
          const updatedArray = element.children.map((child) => {
              if (updatedChild.id === child.id) {
                  return updatedChild;
              } else {
                  return child;
              }
          });
          return { ...element, children: updatedArray };
      };
    */

    //got to walk the structure finding the element
    const updateElements = (selectedElement: HtmlElement, updatedParent: HtmlElement, rootElement: HtmlElement): HtmlElement | undefined => {
        //check children of root element
        if (!rootElement.children) {
            return undefined;
        }
        for (const a of rootElement.children) {
            if (a.id === updatedParent.id) {
                a.selectedChild = selectedElement;
                return a;
            } else {
                return updateElements(selectedElement, updatedParent, a);
            }
        }
    };

    const selectItem = async (element: HtmlElement, parent: HtmlElement) => {
        //there is no need to walk if we are right under first item
        setSelectedElement(element);
        if (props.currentElement.id === parent.id) {
            props.currentElement.selectedChild = element;
            props.setCurrentElement({ ...props.currentElement });
            return;
        }

        parent.selectedChild = element;
        props.setCurrentElement({ ...props.currentElement });

        /*
        const updatedChildren = parent.children.map((a) => {
        });
        */
        /* try this instead
        const updatedElement = updateElements(element, parent, props.currentElement);
        if (updatedElement) {
            props.setCurrentElement({ ...props.currentElement });
        }
        */
    };


    const renderItem = (element: HtmlElement, parent: HtmlElement) => {
        return (
            <ListGroup.Item
                key={element.id}
                action
                active={parent.selectedChild ? element.id === parent.selectedChild.id : false}
                onClick={() => selectItem(element, parent)}>
                {element.type}
            </ListGroup.Item>
        );
    };

    const trashHandler = async (element: HtmlElement | undefined) => {
        if (element) {
            const selectedChild = element.selectedChild;
            if (selectedChild) {
                const updatedChildren = element.children.filter((e) => e.id !== selectedChild.id);
                element.children = updatedChildren;
                props.setCurrentElement({ ...props.currentElement });
            }
        }
    };

    const addHandler = async (element: HtmlElement | undefined) => {
        if (element) {
            const newElement: HtmlElement = {
                id: uniqueId(),
                type: "div",
                index: element.children.length,
                parent: element,
                selectedChild: undefined,
                children: []
            };
            element.children = [...element.children, newElement];
            props.setCurrentElement({ ...props.currentElement });
        }
    };

    const editHandler = (element: HtmlElement | undefined) => {
        if (selectedElement) {
            setShowPicker(true);
        }
    };

  const saveHandler = ([type, textBody, attributes]: [string, string?, string?]) => {
        if (selectedElement) {
            if (selectedElement.parent) {
                setSelectedElement({ ...selectedElement, type: type, body: textBody, attributes: attributes });
                const updatedChildren = selectedElement.parent.children.map((a) => {
                    if (a.id === selectedElement.id) {
                      return { ...selectedElement, type: type, body: textBody , attributes: attributes };
                    } else {
                        return a;
                    }
                });
                selectedElement.parent.children = updatedChildren;
                props.setCurrentElement({ ...props.currentElement });
            }
        }
        setShowPicker(false);
    };

    const renderList = (currentElement: HtmlElement): ReactElement => {

        return (
            <>
                <Col>
                    <BuilderBar
                        addHandler={addHandler}
                        editHandler={editHandler}
                        trashHandler={trashHandler}
                        element={currentElement} />
                    <ListGroup style={{ border: "2px solid purple" }}>
                        {currentElement.children.map((element) => {
                            return renderItem(element, currentElement);
                        })}
                    </ListGroup>
                </Col>
                {
                    currentElement.children.map((childElement) => {
                        if ((currentElement.selectedChild && currentElement.selectedChild.id === childElement.id)) {
                            return renderList(childElement);
                        } else {
                            return ""
                        }
                    })
                }

                {showPicker ?

                    < ElementPicker
                        element={selectedElement}
                        setShowPicker={setShowPicker}
                        saveHandler={saveHandler}
                    />
                    : ""}
            </>
        );

    };

    return renderList(props.currentElement);
};
