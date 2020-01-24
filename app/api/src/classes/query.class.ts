import { FindOptions } from 'sequelize';

export const DEFAULT_LIMIT = 25;

export interface IQuery {
    [key: string]: string;
}

export class QueryClass {
    public limit: number;
    public skip: number;
    public paginate: boolean;

    public query: IQuery;

    constructor(query: any) {
      this.limit = query.limit || DEFAULT_LIMIT;
      delete query.limit;

      this.skip = query.skip || 0;
      delete query.skip;

      this.paginate = query.hasOwnProperty('paginate') && query.paginate === 'false' ? false : true;
      delete query.paginate;

      this.query = query;
    }

    public toSequelizeQuery(): FindOptions {
      return {
        where: this.query,
        limit: this.limit,
        offset: this.skip
      };
    }
  }
