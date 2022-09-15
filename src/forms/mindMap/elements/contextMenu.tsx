import React, { useState, useCallback, useEffect } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { AppActions } from "../../models/mindMaps/actions";
import {
  isContextMenuItem,
  isDeleteShape,
  isPasteShape,
  isPutClipboardShape,
  onCopy,
  onCut,
  onDelete,
  onPaste } from "../../models/mindMaps/menuHandlers";
import { MindMap } from "../../models/mindMaps/state";

const useContextMenu = () => {
  const [xPos, setXPos] = useState("0px");
  const [yPos, setYPos] = useState("0px");
  const [element, setElement] = useState<Element | undefined>(undefined);
  const [showMenu, setShowMenu] = useState(false);

  const handleContextMenu = useCallback(
    (e: any) => {
      e.preventDefault();
      setXPos(`${e.pageX}px`);
      setYPos(`${e.pageY}px`);
      setElement(e.target as Element);
      setShowMenu(true);
    },
    [setXPos, setYPos, element]
  );

  const handleClick = useCallback(() => {
    showMenu && setShowMenu(false);
  }, [showMenu]);

  useEffect(() => {
    document.addEventListener("click", handleClick);
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.addEventListener("click", handleClick);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  });

  return { xPos, yPos, showMenu, element };
};

export interface ContextMenuProps {
  map: MindMap;
  dispatch: React.Dispatch<AppActions>;
  children?: React.ReactNode;
}

export const ContextMenu = (props: ContextMenuProps) => {

  const { xPos, yPos, showMenu, element } = useContextMenu();


  return (
    <>
      {showMenu && isContextMenuItem(element) ? (
        <div
          className="menu-container"
          style={{
            opacity: "1",
            position: "absolute",
            top: yPos,
            left: xPos,
            width: "250px",
          }}
        >
          <Navbar expand="lg" variant="light" bg="light">
            <Nav defaultActiveKey="/home" className="flex-column">
              {isPutClipboardShape(element) ? (
                <>
                  <Nav.Link eventKey="cut" onClick={() => onCut(props.dispatch, element, props.map)}>
                    Cut
                  </Nav.Link>
                  <Nav.Link eventKey="copy" onClick={() => onCopy(props.dispatch, element, props.map)}>
                    Copy
                  </Nav.Link>
                </>
              ) : (
                ""
              )}
              {isPasteShape(element) ? (
                <Nav.Link eventKey="paste" onClick={() => onPaste(props.dispatch, element, props.map)}>
                  Paste
                </Nav.Link>
              ) : (
                ""
              )}
              {isDeleteShape(element) ? (
                <Nav.Link eventKey="delete" onClick={() => onDelete(props.dispatch, element, props.map)}>
                  Delete
                </Nav.Link>
              ) : (
                ""
              )}
            </Nav>
            {props.children}
          </Navbar>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
