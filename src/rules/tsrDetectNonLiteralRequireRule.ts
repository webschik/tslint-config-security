import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

class RuleWalker extends Lint.RuleWalker {
    visitCallExpression(node: ts.CallExpression) {
        const expression: ts.Identifier = node.expression as ts.Identifier;
        const firstArgument: undefined | ts.Expression = node.arguments && node.arguments[0];

        if (
            expression &&
            expression.text === 'require' &&
            firstArgument &&
            firstArgument.kind !== ts.SyntaxKind.StringLiteral &&
            firstArgument.kind !== ts.SyntaxKind.NoSubstitutionTemplateLiteral
        ) {
            this.addFailureAtNode(node, 'Found non-literal argument in require');
        }

        super.visitCallExpression(node);
    }
}
