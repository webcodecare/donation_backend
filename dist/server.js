"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
process.on('uncaughtException', (err) => {
    console.error(err);
    process.exit(1);
});
let server = null;
async function startServer() {
    server = app_1.default.listen(config_1.default.port, () => {
        console.log(`🎯 Server listening on port: ${config_1.default.port}`);
    });
    process.on('unhandledRejection', (error) => {
        if (server) {
            server.close(() => {
                console.log(error);
                process.exit(1);
            });
        }
        else {
            process.exit(1);
        }
    });
}
startServer();
process.on('SIGTERM', () => {
    if (server) {
        server.close();
    }
});
