import * as ts from 'typescript';

export default function syntaxKindToName (kind: ts.SyntaxKind) {
    return (ts as any).SyntaxKind[kind];
}