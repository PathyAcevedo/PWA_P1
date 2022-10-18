//PRACTICA 5 -- IMPLEMENTACION DE LA SIGUIENTE ESTRATEGIA DE CACHE
const STATIC_CACHE_NAME ='static_cache_v1.1';
const INMUTABLE_CACHE_NAME = 'inmutable_cache_v1.1';
const DINAMIC_CACHE_NAME = 'dinamic_cache_v1.1'

function cleanCache(cacheName, numberItems){    
    caches.open(cacheName).then((cache)=>{
    cache.keys().then((keys)=>{
        //console.log(keys.length);
        //eliminamos cuando entre otro  
        if(keys.length > numberItems){ 
            cache.delete(keys[0]).then(cleanCache(cacheName,numberItems))
        }
    });
    });
}

self.addEventListener('install',(event)=>{
    console.log('SW: instalado');
    console.log(event.request.url);

    
const promiseCache = caches.open(STATIC_CACHE_NAME).then((cacheok)=>{
    return cacheok.addAll(
    [   '/',
        "/index.html",
        "/css/style.css",
        "/js/app.js"
    ]
    );
  });

  const promiseCacheInmutable = caches.open(INMUTABLE_CACHE_NAME)
  .then((cache)=>{
    return cache.addAll([
        "https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js",
        "https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js"
    ]);
  });
  event.waitUntil(Promise.all([promiseCache, promiseCacheInmutable]));
});



//cache with network fallback
//PRIMERO INTERNET LUEGO CACHE
self.addEventListener('fetch',(event)=>{
  let resp = null;
  if(event.request.url.includes('pokeapi')){
  const resp = fetch(event.request).then((respWeb)=>{
    if(!respWeb){//si encuentras un 404(hay internet pero no el recurso)
      return caches.match(event.request);//busca en el cache
    }else{
      caches.open(DINAMIC_CACHE_NAME).then((cache)=>{
        cache.put(event.request,respWeb)
        cleanCache(DINAMIC_CACHE_NAME,3)
      });
      return respWeb.clone();
    }
  }).catch(()=>{
    return caches.match(event.request);
  });
}else{
  resp = caches.match(event.request);
}

  event.respondWith(resp);
});


/*
//only cahe
  self.addEventListener('fetch',(event)=>{
    const respCache = caches.match(event.request)
    event.respondWith(respCache); //espera la respuesta de un response

});

self.addEventListener('fetch',(event)=>{
    if(event.request.url.includes('.css')){
        console.log(event.request.url);

        const resp = new Response(
            `body{
                color:red;
                background-color: #000;
            }`,
            {
                headers:{
                    'Content-Type':'text/css',
                },
            }
        );
        event.respondWith(resp);

        event.respondWith(
            fetch('images/img2.jpg'));
    }
    event.respondWith(
        fetch(event.request));

        //if (window.caches) {
  console.log("hey soportas cache");
  //abre el cache y si no exite lo crea
  caches.open("cache-v1");
  caches.open("cache-v2");
  caches.open("cache-v3");

  caches.keys().then((keys) => {
    console.log(keys);
  });
  //especifica y devuelve si tienes un cache que exita o no exita
  caches.match("cache-v4").then((resp) => {
    console.log(resp);
  });

  caches.open("cache-v1").then((uncache) => {
    uncache.add("/index.html");
    uncache.add("/images/img2.jpg");
    uncache.add("/css/style.css");

    uncache
      .addAll(["/index.html", "/images/img2.jpg", "/css/style.css"])
      .then((e) => {
        uncache.delete("/images/img2.jpg");
      });

    uncache.match("/index.html").then((resp) => {
      resp.text().then((text) => {
        console.log("match", text);
      });
    });
  });
  caches.delete("cache-v3");
//}
});
*/
