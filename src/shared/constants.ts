export const DB_PREFIX = "kernai";
export const SCENE_WIDTH = 1800;
export const SCENE_HEIGHT = 2200;
export const TRUNK_WIDTH = 30;
export const BRANCH_HEIGHT = 30;
export const BRANCH_VERTICAL_SPACE = 80;
export const RECT_CORNER_RADIUS = 15;
export const NULL_TITLE = "untitled";
export const TITLE_HEIGHT = 40;
export const ENTER_KEY = "Enter";
export const DELETE_KEY = "Delete";
export const ESCAPE_KEY = "Escape";
export const LOGGING_ENABLED = true;
export const MIME_TYPE_AUDIO = "audio/ogg";
export const ANSWER_ATTACHMENT_KEY = 'answer';
export const QUESTION_ATTACHMENT_KEY = 'question';
export const LEAF_LIMIT = 5;
export const BRANCH_TOOLBAR_BUTTON_COUNT = 5;
export const TOOLBAR_BUTTON_WIDTH = 35;

//fetch id's, could be local storage or restful calls in future
export const FETCH_ID_INITDATABASE = "init";
export const FETCH_ID_CLOSEDATABASE = "close";
export const FETCH_ID_LOADMINDMAPS = "loadMindMaps";
export const FETCH_ID_GETMINDMAP = "getmindmap";
export const FETCH_ID_REMOVEMINDMAP = "removemindmap";
export const FETCH_ID_PUTMINDMAP = "putmindmap";
export const FETCH_ID_ADDBRANCH = "addbranch";
export const FETCH_ID_MOVEBRANCH = "movebranch";
export const FETCH_ID_COPYBRANCH = "copybranch";
export const FETCH_ID_REMOVEBRANCH = "removebranch";
export const FETCH_ID_ADDLEAF = "addleaf";
export const FETCH_ID_REMOVELEAF = "removeleaf";
//stuff like branch and leaf titles, map type dropdown
export const FETCH_ID_TREEPERSIST = "treepersist";
export const FETCH_ID_GETMINDMAPBYLEAF = "getmindmapbyleaf";
export const FETCH_ID_SYNC = "sync";
export const FETCH_ID_INITIALIZELEAF = "initializeleaf";
export const FETCH_ID_PERSISTLEAF = "persistleaf";
export const FETCH_ID_LOADTESTRUN = "loadtestrun";
export const FETCH_ID_PERSISTTESTRUN = "persisttestrun";
export const FETCH_ID_LOADANSWERS = "loadanswers";


export enum XOrientation {
  Left,
  Right
};
export enum Direction {
  Up,
  Down,
  Left,
  Right
}

export enum ShapeType {
  Trunk,
  RightPanel,
  LeftPanel,
  Branch,
  BranchTitle,
  Leaf,
  LeafTitle,
  LeafExpandButton,
  LeafEditButton,
  Unknown
};


