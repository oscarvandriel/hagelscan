const CACHE_NAME = "hagelscan-pro-v1.1";

const APP_FILES = [
  "/hagelscan/index.html"
];

/* ---------------------------------------------------------
   INSTALL
   --------------------------------------------------------- */

self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))

  );

});

/* ---------------------------------------------------------
   ACTIVATE
   --------------------------------------------------------- */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys =>
        Promise.all(

          keys
            .filter(
              key =>
                key.startsWith("hagelscan-pro-") &&
                key !== CACHE_NAME
            )
            .map(
              key =>
                caches.delete(key)
            )

        )
      )
      .then(
        () => self.clients.claim()
      )

  );

});

/* ---------------------------------------------------------
   FETCH
   --------------------------------------------------------- */

self.addEventListener("fetch", event => {

  const request =
    event.request;

  if (request.method !== "GET") {
    return;
  }

  event.respondWith(

    fetch(request, {
      cache: "no-store"
    })

    .then(response => {

      if (
        response &&
        response.status === 200 &&
        response.type === "basic"
      ) {

        const copy =
          response.clone();

        caches.open(CACHE_NAME)
          .then(
            cache =>
              cache.put(
                request,
                copy
              )
          );

      }

      return response;

    })

    .catch(
      () =>
        caches.match(request)
    )

  );

});
