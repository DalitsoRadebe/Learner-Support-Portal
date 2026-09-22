// Resources JavaScript

import { requireAuth } from "./data.js";
import { renderShell } from "./shell.js";


requireAuth(null, function(fbUser, profile) {

    renderShell("resources");

});