import * as Lint from 'tslint';
import * as ts from 'typescript';

const readMethods: string[] = [
    'readUInt8',
    'readUInt16LE',
    'readUInt16BE',
    'readUInt32LE',
    'readUInt32BE',
    'readInt8',
    'readInt16LE',
    'readInt16BE',
    'readInt32LE',
    'readInt32BE',
    'readFloatLE',
    'readFloatBE',
    'readDoubleL',
    'readDoubleBE'
];

const writeMethods: string[] = [
    'writeUInt8',
    'writeUInt16LE',
    'writeUInt16BE',
    'writeUInt32LE',
    'writeUInt32BE',
    'writeInt8',
    'writeInt16LE',
    'writeInt16BE',
    'writeInt32LE',
    'writeInt32BE',
    'writeFloatLE',
    'writeFloatBE',
    'writeDoubleLE',
    'writeDoubleBE'
];

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk);
    }
}

function walk(ctx: Lint.WalkContext<void>) {
    function visitNode(node: ts.Node): void {
        if (node.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const {name, expression} = node as ts.PropertyAccessExpression;
            const parent: ts.CallExpression = node.parent as ts.CallExpression;

            if (parent && parent.kind === ts.SyntaxKind.CallExpression && expression && name) {
                const methodName: string = name.text;
                let argumentIndex: number = -1;

                if (readMethods.indexOf(methodName) !== -1) {
                    argumentIndex = 1;
                } else if (writeMethods.indexOf(methodName) !== -1) {
                    argumentIndex = 2;
                }

                if (
                    argumentIndex !== -1 &&
                    parent.arguments &&
                    parent.arguments[argumentIndex] &&
                    parent.arguments[argumentIndex].kind === ts.SyntaxKind.TrueKeyword
                ) {
                    ctx.addFailureAtNode(node, `Found Buffer.${methodName} with noAssert flag set true`);
                }
            }
        }

        return ts.forEachChild(node, visitNode);
    }

    return ts.forEachChild(ctx.sourceFile, visitNode);
}
