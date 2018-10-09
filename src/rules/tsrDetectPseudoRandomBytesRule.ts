import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

class RuleWalker extends Lint.RuleWalker {
    visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
        const name: ts.Identifier = node.name;

        if (name && name.text === 'pseudoRandomBytes') {
            this.addFailureAtNode(
                node,
                'Found crypto.pseudoRandomBytes which does not produce cryptographically strong numbers'
            );
        }

        super.visitPropertyAccessExpression(node);
    }
}
