import { HtmlElement } from "./htmlElement";

export type HtmlViewModel = {
    currentElement: HtmlElement;
    selectedChild?: HtmlElement;
}
