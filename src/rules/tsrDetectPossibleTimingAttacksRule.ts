import * as ts from 'typescript';
import * as Lint from 'tslint';

const keywordMask = new RegExp(
    '^((' + ['password', 'secret', 'api', 'apiKey', 'token', 'auth', 'pass', 'hash'].join(')|(') + '))$',
    'im'
);

function containsKeyword(node: ts.Expression): boolean {
    return Boolean(node && node.kind === ts.SyntaxKind.Identifier && keywordMask.test((node as ts.Identifier).text));
}

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

class RuleWalker extends Lint.RuleWalker {
    visitIfStatement(node: ts.IfStatement) {
        const expression: ts.BinaryExpression = node.expression as ts.BinaryExpression;

        if (
            expression &&
            expression.operatorToken &&
            (expression.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken ||
                expression.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken ||
                expression.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsToken ||
                expression.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken)
        ) {
            if (containsKeyword(expression.left)) {
                this.addFailureAtNode(expression, 'Potential timing attack on the left side of expression');
            } else if (containsKeyword(expression.right)) {
                this.addFailureAtNode(expression, 'Potential timing attack on the right side of expression');
            }
        }

        super.visitIfStatement(node);
    }
}
