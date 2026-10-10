import { RouteParamtypes } from '@nestjs/common/internal';
import { getRequestCookie, getRequestCookies, getRequestSignedCookie, getRequestSignedCookies, } from '../helpers/cookies/request-cookies.js';
export class RouteParamsFactory {
    config;
    constructor(config) {
        this.config = config;
    }
    exchangeKeyForValue(key, data, { req, res, next }) {
        switch (key) {
            case RouteParamtypes.NEXT:
                return next;
            case RouteParamtypes.REQUEST:
                return req;
            case RouteParamtypes.RESPONSE:
                return res;
            case RouteParamtypes.BODY:
                return data && req.body ? req.body[data] : req.body;
            case RouteParamtypes.RAW_BODY:
                return req.rawBody;
            case RouteParamtypes.PARAM:
                return data ? req.params[data] : req.params;
            case RouteParamtypes.HOST:
                /* eslint-disable-next-line no-case-declarations */
                const hosts = req.hosts || {};
                return data ? hosts[data] : hosts;
            case RouteParamtypes.QUERY:
                return data ? req.query[data] : req.query;
            case RouteParamtypes.HEADERS:
                return data ? req.headers[data.toLowerCase()] : req.headers;
            case RouteParamtypes.SESSION:
                return req.session;
            case RouteParamtypes.FILE:
                return req[data || 'file'];
            case RouteParamtypes.FILES:
                return req.files;
            case RouteParamtypes.IP:
                return req.ip;
            case RouteParamtypes.COOKIES:
                return (data ? getRequestCookie(req, data) : getRequestCookies(req));
            case RouteParamtypes.SIGNED_COOKIES: {
                const signer = this.config?.getCookieSigner();
                return (data
                    ? getRequestSignedCookie(req, data, signer)
                    : getRequestSignedCookies(req, signer));
            }
            default:
                return null;
        }
    }
}
