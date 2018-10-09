import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

class RuleWalker extends Lint.RuleWalker {
    visitNewExpression(node: ts.NewExpression) {
        const expression: ts.Identifier = node.expression as ts.Identifier;
        const firstArgument: undefined | ts.Expression = node.arguments && node.arguments[0];

        if (
            expression &&
            expression.text === 'RegExp' &&
            firstArgument &&
            firstArgument.kind !== ts.SyntaxKind.StringLiteral
        ) {
            this.addFailureAtNode(node, 'Found non-literal argument to RegExp Constructor');
        }

        super.visitNewExpression(node);
    }
}
