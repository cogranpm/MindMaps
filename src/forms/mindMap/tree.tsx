import React, { useContext, useEffect, useLayoutEffect } from "react";
import { FETCH_ID_TREEPERSIST, SCENE_WIDTH, XOrientation } from "../../shared/constants";
import { AppContext } from "../models/mindMaps/context";
import { BackgroundPane } from "./backgroundPane";
import { TreeBranch } from "./branch";
import { Trunk } from "./trunk";
import { ActionType } from "../models/mindMaps/actions";
import { Leaf, MindMap, TabItem } from "../models/mindMaps/state";
import { TitleEditor } from "./modals/titleEdit";
import { getMindMapFromCache, makeBranch } from "../models/mindMaps/factories";
import { logMessage } from "../../shared/errorHandling";
import { LeafEditor } from "./modals/leafEdit";
import { LeafViewer } from "./modals/leafView";
import { TestRunEditor } from "./modals/testRun/testRun";
import { onKeyPress } from "../../shared/keyboardFunctions";
import { addBranch } from "../models/mindMaps/modelHandlers";
import { ContextMenu } from "./elements/contextMenu";
import { MindMapForm } from "./mindMapForm";
import { persist } from "~src/shared/workerClient";
import { Content } from "~src/shared/workerMessages";
import * as styles from "../forms.module.css";

type TreeProps = {
  children?: React.ReactNode;
  tabItem: TabItem;
};

export const Tree = (props: TreeProps) => {
  useEffect(() => {
    logMessage("Tree just rendered.");
  });


  const { state, dispatch } = useContext(AppContext);

  useLayoutEffect(() => {
    logMessage("focus was set");
    if (state.elementToFocus) {
      const element = document.getElementById(state.elementToFocus);
      if (element) {
        element.focus();
        dispatch({ type: ActionType.FocusElement, payload: { id: "" } });
      }
    }
  });


  const mindMap = getMindMapFromCache(state) as MindMap;

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

  const addBranchHandler = async (map: MindMap, orientation: XOrientation) => {
    addBranch(map, orientation, dispatch);
  };

  const handleChangeType = async (event: any) => {
    mindMap.defaultLeafType = event.target.value;
    save();
  };

  /*
  const save = async () => {
    const updatedMindMap = await persist(mindMap);
    dispatch({
      type: ActionType.HideTitleEditor,
      payload: { updatedEntity: updatedMindMap },
    });
  };
  */
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
    <div className={styles.mindMapFormContainer}>
      {mindMap ? (
        <MindMapForm
          mindMap={mindMap}
          defaultLeafTypeChangeHandler={handleChangeType}
        />
      ) : (
        ""
      )}
      <div>
        <svg
          id="svg"
          xmlns="http://www.w3.org/2000/svg"
          fill="white"
          width={SCENE_WIDTH + 5}
          height={mindMap !== undefined ? mindMap.height : 0}
          version="1.1"
          onKeyDown={(e) => onKeyPress(e, mindMap, addBranchHandler)}
        >
          <filter id="shadow" x="0" y="0" width="200%" height="200%">
            <feDropShadow dx="3" dy="3" stdDeviation="1" flood-color="darkgray" flood-opacity="1" />
          </filter>
          <Trunk />
          <BackgroundPane orientation={XOrientation.Left} />
          <BackgroundPane orientation={XOrientation.Right} />
          <TreeBranch />
        </svg>
        {state.showTitleEditor ? (
          <TitleEditor
            handleClose={handleClose}
            title={state.activeEntity ? state.activeEntity.title : ""}
            handleSave={handleSave}
          />
        ) : state.showLeafEditor ? (
          <LeafEditor leaf={state.activeEntity as Leaf} />
        ) : state.showLeafViewer ? (
          <LeafViewer leaf={state.activeEntity as Leaf} />
        ) : state.showTestRunEditor ? (
          <TestRunEditor leaf={state.activeEntity as Leaf} />
        ) : (
          ""
        )}
      </div>
      <ContextMenu map={mindMap} dispatch={dispatch}></ContextMenu>
    </div>
  );
};
