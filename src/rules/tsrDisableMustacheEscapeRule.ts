import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    apply (sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

class RuleWalker extends Lint.RuleWalker {
    visitPropertyAccessExpression (node: ts.PropertyAccessExpression) {
        const {name} = node;
        const parent: ts.BinaryExpression = node.parent as ts.BinaryExpression;

        if (
            name &&
            parent &&
            parent.operatorToken &&
            parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
            parent.right &&
            parent.right.kind === ts.SyntaxKind.FalseKeyword &&
            name.getText() === 'escapeMarkup'
        ) {
            this.addFailureAtNode(node, 'Markup escaping disabled');
        }

        super.visitPropertyAccessExpression(node);
    }
}