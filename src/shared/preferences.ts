import { SelectOption } from "../forms/models/mindMaps/state";

export const PREFERENCE_COUCHURL = "couchurl";
export const PREFERENCE_EDITOR_THEME = "acetheme";
export const PREFERENCE_EDITOR_KEYBINDING = "acekeybinding";

export interface PreferenceOption {
    code: string;
    label: string;
}


export const EDITOR_THEMES: PreferenceOption[] = [
    { code: "ambiance", label: "Ambiance" },
    { code: "chaos", label: "Chaos" },
    { code: "chrome", label: "Chrome" },
    { code: "clouds", label: "Clouds" },
    { code: "cobalt", label: "Cobalt" },
    { code: "crimson_editor", label: "Crimson Editor" },
    { code: "dawn", label: "Dawn" },
    { code: "dreamweaver", label: "Dreamweaver" },
    { code: "dracula", label: "Dracula" },
    { code: "eclipse", label: "Eclipse" },
    { code: "github", label: "GitHub" },
    { code: "gob", label: "Gob" },
    { code: "gruvbox", label: "GruvBox" },
    { code: "idle_fingers", label: "Idle Fingers" },
    { code: "iplastic", label: "IPlastic" },
    { code: "katzenmilch", label: "Katzenmilch" },
    { code: "kr_theme", label: "KR Theme" },
    { code: "terminal", label: "Terminal" }
];

export const EDITOR_KEYBINDINGS: PreferenceOption[] = [
    { code: "ace", label: "Ace" },
    { code: "vim", label: "Vim" },
    { code: "emacs", label: "Emacs" },
    { code: "sublime", label: "Sublime" },
    { code: "vscode", label: "VSCode" }
];

export const getPreference = (key: string, defaultValue = ""): string => {
    const storedValue = localStorage.getItem(key);
    return storedValue ?? defaultValue;
}

export const setPreference = (key: string, value: string) => {
    localStorage.setItem(key, value);
}
