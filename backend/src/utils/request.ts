import * as httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import { Observable } from "rxjs";
import { JWT_SECRET_KEY } from "../constants/auth";
import { createHttpError } from "./response";

export const getBody = (request$: Observable<any>) => {
    return request$
        .switchMap((it) => Observable.of(it.request.body));
};

export const getQuery = (request$: Observable<any>) => {
    return request$
        .switchMap((it) => Observable.of(it.request.query));
};

export const getParams = (request$: Observable<any>) => {
    return request$
        .switchMap((it) => Observable.of(it.params));
};

export const getHeaders = (request$: Observable<any>) => {
    return request$
        .switchMap((it) => Observable.of(it.request.headers));
};

export const getAllParams = (request$: Observable<any>) => {
    return Observable
        .zip(
            getBody(request$),
            getQuery(request$),
            getParams(request$),
            getHeaders(request$),
        )
        .map((response: any[]) => {
            const params = { ...response[0], ...response[1], ...response[2] };
            Object.keys(params).forEach((key) => {
                if (key === "limit" || key === "offset") {
                    params[key] = +params[key];
                }
            });
            const allParams = { params, headers: response[3] };
            return allParams;
        });
};

export const authorizedToken = (request$: Observable<any>) => {
    return request$
    .switchMap((it) => {
        const authorizationHeader = it.request.header.authorization;
        if (!authorizationHeader) {
            throw createHttpError("Unauthorized", httpStatus.UNAUTHORIZED);
        }
        const isBearer = authorizationHeader.slice(0, 7) === "Bearer ";
        if (!isBearer) {
            throw createHttpError("Invalid authorization method", httpStatus.UNAUTHORIZED);
        }
        const token = authorizationHeader.replace("Bearer ", "");
        let user;
        try {
            user = jwt.verify(token, JWT_SECRET_KEY);
        } catch (error) {
            throw createHttpError("Unauthorized", httpStatus.UNAUTHORIZED);
        }
        it.request.user = user;
        return Observable.of(user);
    });
};

export const getSessionUser = (request$: Observable<any>): Observable<any> => {
    return request$
        .switchMap((it) => {
            const sessionUser = it.request.user;
            return Observable.of(sessionUser);
        });
};
