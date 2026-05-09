# Deploy

This folder is a static website. Upload the deploy folder to a static host or a web server.

Entry:

- `index.html`

Model assets:

- `assets/model2.glb`
- `assets/mobile.glb`

Drawing assets:

- `assets/front.png`
- `assets/back.png`
- `assets/left.png`
- `assets/right.png`
- `assets/section.png`

Required MIME types:

- `.html` -> `text/html`
- `.js` -> `text/javascript`
- `.css` -> `text/css`
- `.glb` -> `model/gltf-binary`
- `.wasm` -> `application/wasm`

Example Nginx config:

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/virtual-model-showcase;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    types {
        model/gltf-binary glb;
        application/wasm wasm;
    }
}
```
