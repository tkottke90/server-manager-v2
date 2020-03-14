import { Socket } from "socket.io";

import logger from './logger.service';
import { Logger } from './logger.service';

import { IContext, IHook } from "../interfaces/routing.interfaces";
import Application from "../classes/application.class";

interface ISocketEvent {
  name: string;
  action: (socket: Socket) => (...args: any[]) => void;
}

interface ISocketEndpoint {
  action: (context: IContext) => any;
  name: string;
  beforeHooks?: IHook[];
  afterHooks?: IHook[];
  errorHooks?: IHook[];
}

interface ISocketData {
  params?: any;
  query?: any;
}

export class SocketService {

  private app: Application;
  private logger: Logger;
  private events: ISocketEvent[] = [];

  constructor(app: Application) {
    this.logger = logger;
    this.app = app;
  }

  newSocket = (socket: Socket) => {
    this.logger.log('verbose', `Socket Connected: ${socket.id}`);

    this.events.forEach( event => socket.on(event.name, event.action(socket)) );
  }

  register = (event: ISocketEndpoint) => {
    this.events.push(this.generateSocketEventHandler(event));
  }

  unregister = (eventName: string) => {
    this.events = this.events.filter( event => event.name !== eventName );
  }

  private processHooks = async function*(context: IContext, hooks: any[]) {
    let index = 0;
    let _context: IContext = context;

    while (index < hooks.length) {
      _context = await hooks[index](_context);
      yield { _context, _hookIndex: index };
      index++;
    }

    return _context;
  };

  private handleError = (errorHooks: IHook[]) => async (location: 'before' | 'action' | 'after', context: IContext, socket: Socket): Promise<void> => {
    this.app.logger.log('debug', 'Error handler called ', { error: context.error, method: context.method, step: location });

    for await (const hook of this.processHooks(context, errorHooks)) {
      const { _context, _hookIndex } = hook;
      context = _context;
    }

    const code = context.error?._code || 500;
    socket.emit(`${context.method} failed`, context.error, { code });
  }
  
  private generateSocketEventHandler(socketEvent: ISocketEndpoint) {
    logger.log('debug', `Configuring Socket Event:  ${socketEvent.name}`);

    const outputAction = (socket: Socket) => async ($data: any[]) => {
      logger.log('debug', `Socket Request: ${socketEvent.name}`, {data: $data});

      const _beforeHooks = socketEvent.beforeHooks || [];
      const _afterHooks = socketEvent.afterHooks || [];
      const _errorHooks = socketEvent.errorHooks || [];

      let data;
      switch(typeof $data[1]) {
        case 'string':
          data = { params: {}, query: {}, data: $data, user: undefined };
          break;
        case 'object':
          data = Object.assign({ params: {}, query: {}, data: $data[1].data, user: undefined }, $data[1]);
          break;
        default :
          data = data = { params: {}, query: {}, data: $data, user: undefined };
      }

      let context: IContext = {
        request: null,
        response: null,
        app: this.app,
        method: socketEvent.name,
        params: data.params,
        query: data.query,
        data,
        user: data.user,
      };

      const errorHandler = this.handleError(_errorHooks);

      // Before Hooks
      for await (const hook of this.processHooks(context, _beforeHooks )) {
        const { _context, _hookIndex } = hook;
        context = _context;

        // If there is an error or the result is returned, then
        if (context.error) {
          errorHandler('before', context, socket);
          return;
        }

        // If result is set, skip the remaining hooks
        if (context.result) { break; }
      }

      if (!context.result) {
        try {
          context.result = await socketEvent.action(context);
        } catch (err) {
          context.error = err;
          errorHandler('action', context, socket);
          return;
        }
      }

      // After Hooks
      for await (const hook of this.processHooks(context, _afterHooks )) {
        const { _context, _hookIndex } = hook;
        context = _context;

        // If there is an error or the result is returned, then
        if (context.error) {
          errorHandler('after', context, socket);
          return;
        }
      }

      const status = context.result._code || 200;
      const result = context.result._code ? context.result.data : context.result;
      socket.emit(context.method, result, { status });
    }

    return { name: socketEvent.name, action: outputAction };
  }

}