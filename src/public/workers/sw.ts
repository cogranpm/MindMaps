/// <reference lib="WebWorker" />

// export empty type because of tsc --isolatedModules flag
export type {};
declare const self: ServiceWorkerGlobalScope;


self.addEventListener("install", function (event) {
    console.log("service worker activated");
});

self.addEventListener("activate", function (event) {
    console.log("service worker activated");
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
});