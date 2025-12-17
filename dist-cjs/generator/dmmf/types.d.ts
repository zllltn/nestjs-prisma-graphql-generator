import { ReadonlyDeep, uniqueIndex } from '@prisma/dmmf';
import { InputOmitSetting } from '../config';
export declare namespace DMMF {
    interface Document {
        datamodel: Datamodel;
        schema: Schema;
        modelMappings: ModelMapping[];
    }
    interface Enum {
        name: string;
        dbName?: string | null;
        typeName: string;
        docs: string | undefined;
        valuesMap: Array<{
            name: string;
            value: string;
        }>;
    }
    interface Datamodel {
        models: Model[];
        enums: Enum[];
        types: Model[];
    }
    interface UniqueIndex {
        name: string;
        fields: string[];
    }
    interface PrimaryKey {
        name: string | null;
        fields: string[];
    }
    interface Model {
        readonly name: ReadonlyDeep<string>;
        readonly dbName: ReadonlyDeep<string | null>;
        readonly schema: ReadonlyDeep<string | null>;
        fields: any[];
        readonly uniqueFields: ReadonlyDeep<string[][]>;
        readonly uniqueIndexes: ReadonlyDeep<uniqueIndex[]>;
        readonly documentation?: ReadonlyDeep<string | undefined>;
        readonly primaryKey: ReadonlyDeep<PrimaryKey | null>;
        readonly isGenerated?: ReadonlyDeep<boolean | undefined>;
        typeName: string;
        docs: string | undefined;
    }
    type FieldKind = 'scalar' | 'object' | 'enum' | 'unsupported';
    type FieldNamespace = 'model' | 'prisma';
    type FieldLocation = 'scalar' | 'inputObjectTypes' | 'outputObjectTypes' | 'enumTypes';
    interface ModelField {
        name: string;
        isRequired: boolean;
        isList: boolean;
        isUnique: boolean;
        isId: boolean;
        isReadOnly: boolean;
        isGenerated?: boolean;
        isUpdatedAt?: boolean;
        dbNames?: string[] | null;
        hasDefaultValue: boolean;
        default?: FieldDefault | FieldDefaultScalar | FieldDefaultScalar[];
        relationToFields?: any[];
        relationOnDelete?: string;
        relationName?: string;
        type: string;
        location: FieldLocation;
        typeFieldAlias?: string;
        typeGraphQLType: string;
        fieldTSType: string;
        docs: string | undefined;
        isOmitted: {
            input: boolean | InputOmitSetting[];
            output: boolean;
        };
    }
    interface FieldDefault {
        name: string;
        args: any[];
    }
    type FieldDefaultScalar = string | boolean | number;
    interface Schema {
        rootQueryType?: string;
        rootMutationType?: string;
        inputTypes: InputType[];
        outputTypes: OutputType[];
        enums: Enum[];
    }
    interface Query {
        name: string;
        args: SchemaArg[];
        output: QueryOutput;
    }
    interface QueryOutput {
        name: string;
        isRequired: boolean;
        isList: boolean;
    }
    type ArgType = string | InputType | Enum;
    interface SchemaArgInputType {
        isList: boolean;
        location: FieldLocation;
        namespace?: FieldNamespace;
        type: string;
    }
    interface SchemaArg {
        name: string;
        comment?: string;
        isNullable: boolean;
        isRequired: boolean;
        deprecation?: Deprecation;
        selectedInputType: SchemaArgInputType;
        typeName: string;
        typeGraphQLType: string;
        fieldTSType: string;
        hasMappedName: boolean;
        isOmitted: boolean;
    }
    interface OutputType {
        name: string;
        fields: OutputSchemaField[];
        typeName: string;
        modelName: string | undefined;
    }
    interface SchemaField {
        name: string;
        outputType: TypeInfo;
        args: SchemaArg[];
        deprecation?: Deprecation;
        documentation?: string;
        typeGraphQLType: string;
        fieldTSType: string;
        isRequired: boolean;
    }
    interface Deprecation {
        sinceVersion: string;
        reason: string;
        plannedRemovalVersion?: string;
    }
    interface TypeInfo {
        isList: boolean;
        location: FieldLocation;
        namespace?: FieldNamespace;
        type: string;
    }
    interface OutputSchemaField extends SchemaField {
        argsTypeName: string | undefined;
    }
    interface InputType {
        name: string;
        constraints: {
            maxNumFields: number | null;
            minNumFields: number | null;
        };
        fields: SchemaArg[];
        typeName: string;
        modelName: string | undefined;
        modelType: Model | undefined;
    }
    interface ModelMapping {
        model: string;
        actions: Action[];
        collectionName: string;
        resolverName: string;
        modelTypeName: string;
    }
    enum ModelAction {
        findUnique = "findUnique",
        findFirst = "findFirst",
        findMany = "findMany",
        createOne = "createOne",
        createMany = "createMany",
        updateOne = "updateOne",
        updateMany = "updateMany",
        upsertOne = "upsertOne",
        deleteOne = "deleteOne",
        deleteMany = "deleteMany",
        groupBy = "groupBy",
        aggregate = "aggregate",
        findRaw = "findRaw",
        aggregateRaw = "aggregateRaw"
    }
    interface Action {
        name: string;
        fieldName: string;
        kind: ModelAction;
        operation: 'Query' | 'Mutation';
        prismaMethod: string;
        method: OutputSchemaField;
        argsTypeName: string | undefined;
        outputTypeName: string;
        actionResolverName: string;
        returnTSType: string;
        typeGraphQLType: string;
    }
    interface RelationModel {
        model: Model;
        outputType: OutputType;
        relationFields: RelationField[];
        resolverName: string;
    }
    interface RelationField extends ModelField {
        outputTypeField: OutputSchemaField;
        argsTypeName: string | undefined;
    }
}
