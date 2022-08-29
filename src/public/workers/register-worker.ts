const ctx: Worker = self as any;


export const registerWorker = () => {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register(new URL("./sw.ts", import.meta.url), { type: 'module' })
            .then(registration => console.log("service worker registered!"))
            .catch(err => console.log("failed to register service worker!"));
    }
};

export default null;