/* @ts-self-types="./vtracer_webapp.d.ts" */
import * as wasm from "./vtracer_webapp_bg.wasm";
import { __wbg_set_wasm } from "./vtracer_webapp_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    BinaryImageConverter, ColorImageConverter, main
} from "./vtracer_webapp_bg.js";
