import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

class RuleWalker extends Lint.RuleWalker {
    private isCsrfFound?: boolean;

    visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
        const name: ts.Identifier = node.name as ts.Identifier;
        const expression: ts.Identifier = node.expression as ts.Identifier;

        if (name && expression && expression.text === 'express') {
            if (name.text === 'methodOverride' && this.isCsrfFound) {
                this.addFailureAtNode(node, 'express.csrf() middleware found before express.methodOverride()');
            } else if (name.text === 'csrf') {
                this.isCsrfFound = true;
            }
        }

        super.visitPropertyAccessExpression(node);
    }
}
