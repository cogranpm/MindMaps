import React, { useContext } from "react";
import {
  RECT_CORNER_RADIUS,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  ShapeType,
  TRUNK_WIDTH,
} from "../../shared/constants";
import { AppContext } from "../models/mindMaps/context";
import { getMindMapFromCache } from "../models/mindMaps/factories";

export const Trunk = () => {
  const { state } = useContext(AppContext);
  const mindMap = getMindMapFromCache(state);

  return (
    <rect
      x={SCENE_WIDTH / 2 - TRUNK_WIDTH / 2}
      y={0}
      width={TRUNK_WIDTH}
      height={mindMap ? mindMap.height : SCENE_HEIGHT}
      fill="skyblue"
      tabIndex={0}
      rx={RECT_CORNER_RADIUS}
      data-shape-type={ShapeType.Trunk}
    />
  );
};
