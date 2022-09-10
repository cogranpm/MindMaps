import { ActionType, AppActions } from "./actions";
import { updateBranch, updateLeaf, getMindMapFromCache } from "./factories";
import { AppState, MindMap, TabItem, MindMapViewModel } from "./state";


//when actions are dispatched they come here
//actions are defined in the actions module

export function appReducer(state: AppState, action: AppActions): AppState {
    const mindMap = getMindMapFromCache(state);
    switch (action.type) {
        case ActionType.InitList:
            return { ...state, items: [...action.payload.items] };
        case ActionType.Add:
            return { ...state, items: [...state.items, action.payload.newMindMap] };
        case ActionType.Remove:
            const items = state.items.filter((item) => item._id !== action.payload.id);
            return { ...state, items: items };
        case ActionType.EditMindMap:
            const updatedViewModels = state.items.map((item) => {
                if (item._id === action.payload.updatedEntity._id) {
                    return { ...item, name: action.payload.updatedEntity.name } as MindMapViewModel;
                } else {
                    return item;
                }
            });
            return { ...state, items: updatedViewModels, tabs: updateCache(state.tabs, action.payload.updatedEntity) }
        case ActionType.EditBranch:
            if (mindMap) {
                const updatedMindMap = updateBranch(mindMap, action.payload.branch);
                return { ...state, tabs: updateCache(state.tabs, updatedMindMap) };
            } else {
                return state;
            }
        case ActionType.EditLeaf:
            if (mindMap) {
                const updatedMindMap = updateLeaf(mindMap, action.payload.branch, action.payload.leaf);
                return { ...state, tabs: updateCache(state.tabs, updatedMindMap) };
            } else {
                return state;
            }
        case ActionType.ShowTitleEditor:
            return { ...state, showTitleEditor: true, activeEntity: action.payload.entity };
        case ActionType.HideTitleEditor:
            return { ...state, showTitleEditor: false, tabs: updateCache(state.tabs, action.payload.updatedEntity) };
        case ActionType.OpenTab:
            const targetTab = state.tabs.find((tab: TabItem) => tab.mindMap._id === action.payload.entity._id);
            if (targetTab !== undefined) {
                return { ...state, activeTabId: targetTab.mindMap._id };
            } else {
                return { ...state, activeTabId: action.payload.entity._id, tabs: [...state.tabs, { mindMap: action.payload.entity }] };
            }
        case ActionType.SwitchTab:
            return { ...state, activeTabId: action.payload.tabId };
        case ActionType.CloseTab:
            const updatedTabs = state.tabs.filter((tab) => {
                return tab.mindMap._id !== action.payload.tabItem.mindMap._id;
            });
            const updatedState = {...state, tabs: updatedTabs};
            if(updatedTabs.length === 0){
                updatedState.activeTabId = "home";
            }  else {
                updatedState.activeTabId = updatedTabs[updatedTabs.length - 1].mindMap._id;
            }
            console.log(updatedState);
            return updatedState;
        case ActionType.ShowLeafEditor:
            return { ...state, showLeafEditor: true, activeEntity: action.payload.leaf };
        case ActionType.HideLeafEditor:
            return { ...state, showLeafEditor: false, tabs: updateCache(state.tabs, action.payload.updatedEntity) };
        case ActionType.ShowLeafViewer:
            return { ...state, showLeafViewer: true, activeEntity: action.payload.leaf };
        case ActionType.HideLeafViewer:
            return { ...state, showLeafViewer: false };
        case ActionType.ShowTestRunEditor:
            return { ...state, showTestRunEditor: true, activeEntity: action.payload.leaf };
        case ActionType.HideTestRunEditor:
            return { ...state, showTestRunEditor: false };
        case ActionType.FocusElement:
            return { ...state, elementToFocus: action.payload.id };
        default:
            return state;
    }
}


const updateCache = (cache: TabItem[], mindMap: MindMap): TabItem[] => {
    const updatedCache = cache.map((tabItem) => {
        if (tabItem.mindMap._id === mindMap._id) {
            return { ...tabItem, mindMap: mindMap };
        } else {
            return tabItem;
        }
    });
    return updatedCache;
}
