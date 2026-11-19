# Assets

| File | Source | License |
|---|---|---|
| `Michelle.glb`, `Soldier.glb`, `Xbot.glb` | three.js examples (r160), Mixamo-rigged characters | Fine for prototyping. Check Mixamo/Adobe terms before a commercial release |
| `lobby.exr.js`, `night.exr.js` | Poly Haven HDRIs via `@pmndrs/assets` 1.7.0 (base64 EXR) | CC0 |

The HDRIs are shipped as JS modules (`export default 'data:application/exr;base64,...'`) and decoded in the page, so they load as scripts.
