import { Branch, Leaf, MindMap } from "./state";

export const findBranchInMap = (map: MindMap, branchId: string) : Branch | undefined => {
  return map.branches.find((theBranch) => theBranch.id === branchId);
};

export const findLeafInMap = (map: MindMap, branchId: string, leafId: string): Leaf | undefined => {
  const branch = findBranchInMap(map, branchId);
  if(branch){
    return branch.leaves.find((theLeaf) => theLeaf.id === leafId);
  }
  return undefined;
};