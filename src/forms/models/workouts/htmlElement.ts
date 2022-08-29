export type HtmlElement = {
    id: string;
    type: string;
    index: number;
    children: HtmlElement[];
    parent?: HtmlElement;
    selectedChild?: HtmlElement;
    body?: string;
    attributes?: string;
};
