import * as ts from 'typescript';

export type StringLiteral = ts.NoSubstitutionTemplateLiteral | ts.StringLiteral;

export const stringLiteralKinds: number[] = [ts.SyntaxKind.NoSubstitutionTemplateLiteral, ts.SyntaxKind.StringLiteral];
