"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MauService = void 0;
const undici_1 = require("undici");
const cli_constants_1 = require("../cli.constants");
class MauService {
    static async initializeDeployment(apiKey, apiSecret) {
        return (0, undici_1.request)(`${cli_constants_1.API_URL}/deployments/initialize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey,
                'X-Api-Secret': apiSecret,
            },
        }).then(async (res) => {
            const json = await MauService.toJSON(res);
            if (res.statusCode < 400) {
                return json;
            }
            throw new Error(json.message);
        });
    }
    static async finalizeDeployment(apiKey, apiSecret, payload) {
        return (0, undici_1.request)(`${cli_constants_1.API_URL}/deployments/finalize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey,
                'X-Api-Secret': apiSecret,
            },
            body: JSON.stringify(payload),
        }).then(async (res) => {
            const json = await MauService.toJSON(res);
            if (res.statusCode < 400) {
                return json;
            }
            throw new Error(json.message);
        });
    }
    static async verifyDeploymentStatus(apiKey, apiSecret, payload) {
        return (0, undici_1.request)(`${cli_constants_1.API_URL}/deployments/${payload.deploymentId}/status?job=${payload.jobId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey,
                'X-Api-Secret': apiSecret,
            },
        }).then(async (res) => {
            const json = await MauService.toJSON(res);
            if (res.statusCode < 400) {
                return json;
            }
            throw new Error(json.message);
        });
    }
    static async initializeSshSession(apiKey, apiSecret) {
        return (0, undici_1.request)(`${cli_constants_1.API_URL}/ssh/initialize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey,
                'X-Api-Secret': apiSecret,
            },
        }).then(async (res) => {
            const json = await MauService.toJSON(res);
            if (res.statusCode < 400) {
                return json;
            }
            throw new Error(json.message);
        });
    }
    static async initializeAccessLogsSession(apiKey, apiSecret) {
        return (0, undici_1.request)(`${cli_constants_1.API_URL}/applications/access-logs/session/initialize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey,
                'X-Api-Secret': apiSecret,
            },
        }).then(async (res) => {
            const json = await MauService.toJSON(res);
            if (res.statusCode < 400) {
                return json;
            }
            throw new Error(json.message);
        });
    }
    static async toJSON(res) {
        try {
            return await res.body.json();
        }
        catch {
            throw new Error('An error occurred while finalizing the deployment.');
        }
    }
}
exports.MauService = MauService;
