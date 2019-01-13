import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

class RuleWalker extends Lint.RuleWalker {
    visitCallExpression(node: ts.CallExpression) {
        const {expression, arguments: args} = node;

        if (
            expression &&
            args &&
            expression.kind === ts.SyntaxKind.ElementAccessExpression &&
            args.find(ts.isIdentifier)
        ) {
            this.addFailureAtNode(node, 'Found unsafe properties access');
        }

        super.visitCallExpression(node);
    }
}
