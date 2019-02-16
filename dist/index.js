"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_routes_1 = require("./index.routes");
const port = process.env.PORT || 4200;
index_routes_1.default.listen(port, (err) => {
    if (err) {
        return console.log(err);
    }
    return console.log(`server is listening on ${port}`);
});
//# sourceMappingURL=index.js.map