import { DMMF } from './dmmf/types';
export type SupportedQueries = keyof Pick<typeof DMMF.ModelAction, 'findUnique' | 'findFirst' | 'findMany' | 'aggregate' | 'groupBy'>;
export declare const supportedQueryActions: SupportedQueries[];
export type SupportedMutations = keyof Pick<typeof DMMF.ModelAction, 'createOne' | 'createMany' | 'deleteOne' | 'updateOne' | 'deleteMany' | 'updateMany' | 'upsertOne'>;
export declare const supportedMutationActions: SupportedMutations[];
export declare enum InputOmitSetting {
    Create = "create",
    Update = "update",
    Where = "where",
    OrderBy = "orderBy"
}
