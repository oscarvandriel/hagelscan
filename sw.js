const CACHE_NAME = "hagelscan-pro-v1.0.2";

/* ---------------------------------------------------------
   INSTALL
--------------------------------------------------------- */

self.addEventListener("install", event => {

  /*
     Nieuwe service worker mag meteen klaarstaan.
  */

  self.skipWaiting();

});


/* ---------------------------------------------------------
   ACTIVATE
--------------------------------------------------------- */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key =>
              key.startsWith("hagelscan-pro-") &&
              key !== CACHE_NAME
            )
            .map(key =>
              caches.delete(key)
            )

        );

      })
      .then(() =>
        self.clients.claim()
      )

  );

});


/* ---------------------------------------------------------
   NIEUWE VERSIE DIRECT ACTIVEREN
--------------------------------------------------------- */

self.addEventListener("message", event => {

  if (
    event.data &&
    event.data.type === "SKIP_WAITING"
  ) {

    self.skipWaiting();

  }

});


/* ---------------------------------------------------------
   FETCH
--------------------------------------------------------- */

self.addEventListener("fetch", event => {

  /*
     Voor HagelScan willen we altijd eerst
     de nieuwste versie van de server proberen.

     Alleen als er geen internetverbinding is,
     gebruiken we de cache.
  */

  if (
    event.request.method !== "GET"
  ) {

    return;

  }


  event.respondWith(

    fetch(
      event.request,
      {
        cache: "no-store"
      }
    )

    .then(response => {

      /*
         Nieuwe bestanden opslaan voor offline gebruik.
      */

      if (
        response &&
        response.status === 200 &&
        response.type === "basic"
      ) {

        const copy =
          response.clone();

        caches.open(
          CACHE_NAME
        )
        .then(cache => {

          cache.put(
            event.request,
            copy
          );

        });

      }

      return response;

    })

    .catch(() => {

      /*
         Geen internet?
         Gebruik de laatst bekende versie.
      */

      return caches.match(
        event.request
      );

    })

  );

});
