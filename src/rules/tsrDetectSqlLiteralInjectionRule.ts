import * as Lint from 'tslint';
import * as ts from 'typescript';
import {isSqlQuery} from '../is-sql-query';
import {stringLiteralKinds} from '../node-kind';

const generalErrorMessage: string = 'Found possible SQL injection';

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk);
    }
}

function walk(ctx: Lint.WalkContext<void>) {
    function visitNode(node: ts.Node): void {
        switch (node.kind) {
            case ts.SyntaxKind.TemplateExpression: {
                const {parent} = node;

                if (
                    (!parent || parent.kind !== ts.SyntaxKind.TaggedTemplateExpression) &&
                    isSqlQuery(node.getText().slice(1, -1))
                ) {
                    ctx.addFailureAtNode(node, generalErrorMessage);
                }
                break;
            }
            case ts.SyntaxKind.BinaryExpression: {
                const {left} = node as ts.BinaryExpression;

                if (left && stringLiteralKinds.includes(left.kind) && isSqlQuery(left.getText().slice(1, -1))) {
                    ctx.addFailureAtNode(left, generalErrorMessage);
                }
                break;
            }
            default:
            //
        }

        return ts.forEachChild(node, visitNode);
    }

    return ts.forEachChild(ctx.sourceFile, visitNode);
}
