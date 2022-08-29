import { Branch, Leaf, MindMap, MindMapViewModel, TabItem } from "./state";

export enum ActionType {
    InitList,
    Add,
    Remove,
    EditMindMap,
    RemoveMindMap,
    EditBranch,
    EditLeaf,
    ShowTitleEditor,
    HideTitleEditor,
    ShowLeafEditor,
    HideLeafEditor,
    ShowLeafViewer,
    HideLeafViewer,
    ShowTestRunEditor,
    HideTestRunEditor,
    OpenTab,
    SwitchTab,
    CloseTab,
    FocusElement
}

export interface InitList {
    type: ActionType.InitList;
    payload: { items: MindMapViewModel[] };
}

export interface Add {
    type: ActionType.Add;
    payload: { newMindMap: MindMap };
}

export interface Remove {
    type: ActionType.Remove;
    payload: { id: string };
}

export interface EditMindMap {
    type: ActionType.EditMindMap;
    payload: { updatedEntity: MindMap };
}

export interface EditBranch {
    type: ActionType.EditBranch;
    payload: { branch: Branch };
}

export interface EditLeaf {
    type: ActionType.EditLeaf;
    payload: { branch: Branch, leaf: Leaf };
}

export interface ShowTitleEditor {
    type: ActionType.ShowTitleEditor;
    payload: { entity: Branch | Leaf };
}

export interface HideTitleEditor {
    type: ActionType.HideTitleEditor;
    payload: { updatedEntity: MindMap };
}

export interface ShowLeafEditor {
    type: ActionType.ShowLeafEditor;
    payload: { leaf: Leaf };
}

export interface HideLeafEditor {
    type: ActionType.HideLeafEditor;
    payload: { updatedEntity: MindMap };
}

export interface ShowLeafViewer {
    type: ActionType.ShowLeafViewer;
    payload: { leaf: Leaf };
}

export interface HideLeafViewer {
    type: ActionType.HideLeafViewer;
}

export interface HideTestRunEditor {
    type: ActionType.HideTestRunEditor;
}

export interface ShowTestRunEditor {
    type: ActionType.ShowTestRunEditor;
    payload: { leaf: Leaf };
}


export interface OpenTab {
    type: ActionType.OpenTab;
    payload: { entity: MindMap };
}

export interface SwitchTab {
    type: ActionType.SwitchTab;
    payload: { tabId: string };
}

export interface CloseTab {
    type: ActionType.CloseTab;
    payload: { tabItem: TabItem };
}

export interface FocusElement {
    type: ActionType.FocusElement;
    payload: { id: string };
};

export type AppActions =
    InitList |
    Add |
    Remove |
    EditMindMap |
    EditBranch |
    EditLeaf |
    ShowTitleEditor |
    HideTitleEditor |
    ShowLeafEditor |
    HideLeafEditor |
    ShowLeafViewer |
    HideLeafViewer |
    ShowTestRunEditor |
    HideTestRunEditor |
    OpenTab |
    SwitchTab |
    CloseTab |
    FocusElement;
