import { IContext } from '../interfaces/index';

export function hashFieldsHook(fields: string[]) {
  return async (context: IContext) => {

    const updates = fields.map( async (item) => {
      if (context.data && context.data[item]) {
        context.data[item] = await context.app.authentication.hashString(context.data[item]);
      }
    });

    return Promise.all(updates).then( () => context );
  };
}
