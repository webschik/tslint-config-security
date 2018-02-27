import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    apply (sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

class RuleWalker extends Lint.RuleWalker {
    visitPropertyAccessExpression (node: ts.PropertyAccessExpression) {
        const expression: ts.Identifier = node.expression as ts.Identifier;
        const name: ts.Identifier = node.name;
        const parent: ts.CallExpression = node.parent as ts.CallExpression;
        const firstArgument: undefined|ts.Expression = parent && parent.arguments && parent.arguments[0];

        if (
            expression &&
            expression.text === 'document' &&
            name &&
            name.text === 'write' &&
            firstArgument &&
            firstArgument.kind !== ts.SyntaxKind.StringLiteral
        ) {
            this.addFailureAtNode(parent, 'Found document.write with non-literal argument');
        }

        super.visitPropertyAccessExpression(node);
    }

    visitBinaryExpression (node: ts.BinaryExpression) {
        const left: ts.PropertyAccessExpression = node.left as ts.PropertyAccessExpression;
        const right: ts.Expression = node.right;

        if (
            node.operatorToken &&
            node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
            left &&
            left.kind === ts.SyntaxKind.PropertyAccessExpression &&
            right &&
            right.kind !== ts.SyntaxKind.StringLiteral
        ) {
            this.addFailureAtNode(node, 'Found Element.innerHTML with non-literal value');
        }

        super.visitBinaryExpression(node);
    }
}