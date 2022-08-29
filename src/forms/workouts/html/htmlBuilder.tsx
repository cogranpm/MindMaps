import React, { useState, useEffect } from "react";
import { Container, Row, Col, ListGroup } from "react-bootstrap";
import { HtmlElement } from "~src/forms/models/workouts/htmlElement";
import { uniqueId } from "~src/shared/uuid";
import { HtmlList } from "./htmlList";
import { BuilderBar } from "./builderBar";
import { ElementPicker } from "./elementPicker";

export const HtmlBuilder = () => {

    const [elements, setElements] = useState<HtmlElement[]>([]);
    const [selectedElement, setSelectedElement] = useState<HtmlElement | undefined>(undefined);
    const [showPicker, setShowPicker] = useState(false);

    const makeDiv = (index: number, parent: HtmlElement | undefined): HtmlElement => {
        return { id: uniqueId(), type: 'div', index: index, parent: parent, children: [] };
    };

    const makeGenericChild = (type: string, index: number, parent: HtmlElement): HtmlElement => {
        return { id: uniqueId(), type: type, index: index, parent: parent, children: [] };
    };

    /*
    const edgeElement: HtmlElement = makeDiv([], 0);
    const edgeElementChildren = [makeGenericChild("dl", 0, edgeElement), makeGenericChild("dl", 1, edgeElement)];
    edgeElement.children = edgeElementChildren;

    const edge0 = makeDiv([edgeElement, makeGenericChild("5", 0), makeGenericChild("5", 1)], 0);
    edgeElement.parent = edge0;

    const edge1 = makeDiv([edge0, makeGenericChild("4", 0), makeGenericChild("4", 1)], 0);
    edge0.parent = edge1;

    const edge2 = makeDiv([edge1, makeGenericChild("3", 0), makeGenericChild("3", 1)], 0);
    edge1.parent = edge2;
    */

    const root = makeDiv(0, undefined);
    const a = makeDiv(0, root);
    root.children = [a, makeGenericChild("span", 1, root), makeGenericChild("span", 2, root)];

    const b = makeDiv(0, a);
    a.children = [b, makeGenericChild("dl", 1, a), makeGenericChild("dl", 2, a)];

    const c = makeDiv(0, b);
    b.children = [c, makeGenericChild("img", 1, b), makeGenericChild("img", 2, b)];

    const d = makeDiv(0, c);
    c.children = [d, makeGenericChild("h1", 1, c), makeGenericChild("h1", 2, c)];

    const roota = makeDiv(1, undefined);
    const rootb = makeDiv(2, undefined);

    useEffect(() => {
        const loadedElements = loadElements();
        setElements(loadedElements);
    }, []);

    const loadElements = (): HtmlElement[] => {
        return [
            root,
            roota,
            rootb
        ];
    };

    const addElement = (index: number, type: string) => {
        let element: HtmlElement;
        element = {
            id: uniqueId(),
            type: type, index: index, children: [
                { id: uniqueId(), type: 'span', index: 0, children: [], parent: undefined }
            ], parent: undefined
        };
        return element;
    };

    const addParagraph = (index: number): HtmlElement => {
        return { id: uniqueId(), type: 'p', index: index, children: [], parent: undefined };
    };


    /*
    const add = (event: any) => {
        const addedElement = elements.length % 2 === 0 ? addElement(elements.length, 'div') : addParagraph(elements.length);
        setElements([...elements, addedElement]);
    };
    */

    const selectItem = async (element: HtmlElement) => {
        if (element.parent) {
            element.parent.selectedChild = element;
        }
        setSelectedElement(element);
    };

    const trashHandler = async (element: HtmlElement | undefined) => {
        if (selectedElement) {
            const updatedElements = selectedElement.children.filter((e) => e.id !== selectedElement.id);
            setElements(updatedElements);
            setSelectedElement(undefined);
        }
    };

    const addHandler = async (element: HtmlElement | undefined) => {
        const addedElement = elements.length % 2 === 0 ? addElement(elements.length, 'div') : addParagraph(elements.length);
        setElements([...elements, addedElement]);
        setShowPicker(true);
    };

    const editHandler = (element: HtmlElement | undefined) => {
        if (selectedElement) {
            setShowPicker(true);
        }
    };

  const saveHandler = ( [type, textBody, attributes]: [string, string?, string?]) => {
        setShowPicker(false);
        if (selectedElement) {
          setSelectedElement({ ...selectedElement, type: type, body: textBody, attributes: attributes  });
            const updatedElements = elements.map((a) => {
                if (a.id === selectedElement.id) {
                  return { ...selectedElement, type: type , body: textBody, attributes: attributes };
                }
                else {
                    return a;
                }
            });
            setElements(updatedElements);
        }
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <BuilderBar
                        addHandler={addHandler}
                        editHandler={editHandler}
                        trashHandler={trashHandler}
                        element={selectedElement} />
                    <ListGroup>
                        {elements.map((element) => {
                            return (
                                <ListGroup.Item
                                    key={element.id}
                                    active={selectedElement ? element.id === selectedElement.id : false}
                                    action
                                    onClick={() => selectItem(element)}>
                                    {element.type}
                                </ListGroup.Item>
                            )
                        })}
                    </ListGroup>
                </Col >
                {
                    selectedElement
                        ? <HtmlList
                            currentElement={selectedElement}
                            parent={undefined}
                            setCurrentElement={setSelectedElement}
                        />
                        : ""
                }
                {showPicker ?
                    <ElementPicker
                        element={selectedElement}
                        setShowPicker={setShowPicker}
                        saveHandler={saveHandler}
                    /> : ""}

            </Row >
        </Container>
    )
};
