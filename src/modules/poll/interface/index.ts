export enum PollEnum {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

export interface IQuery {
  page?: number;
  limit?: number;
}
