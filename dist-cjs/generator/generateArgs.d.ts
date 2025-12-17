import { Project } from 'ts-morph';
import { DmmfDocument } from './dmmf/DmmfDocument';
import { DMMF } from './dmmf/types';
export declare const generateArgs: (dmmfDocument: DmmfDocument, project: Project, outputDir: string, model: DMMF.Model) => void;
