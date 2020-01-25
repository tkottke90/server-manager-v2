import Application from '../classes/application.class';
import { Request, Response } from 'express';

export interface IRoute {
    method: 'get' | 'post' | 'patch' | 'put' | 'delete' | 'options';
    path: string;
    action: (context: IContext) => any;
    beforeHooks?: IHook[]
    afterHooks?: IHook[],
    errorHooks?: IHook[],
}

export interface IContext {
    readonly request: Request;
    readonly response: Response;
    readonly app: Application;
    readonly params: { [key: string]: any }
    readonly query: { [key: string]: any }
    readonly user: any;
    result?: any;
    error?: any
}

export interface IHook {
    (context: IContext): IContext
}