import * as Lint from 'tslint';
import * as ts from 'typescript';
import {stringLiteralKinds} from '../node-kind';

export class Rule extends Lint.Rules.AbstractRule {
    static metadata: Lint.IRuleMetadata = {
        ruleName: 'tsr-detect-non-literal-regexp',
        description: 'Warns when RegExp constructor with non-literal argument is used',
        descriptionDetails: Lint.Utils.dedent`Any usage of new RegExp()
            with non-literal argument will trigger a warning.
            See https://github.com/webschik/tslint-config-security#tsr-detect-non-literal-regexp`,
        optionsDescription: '',
        options: null,
        type: 'functionality',
        requiresTypeInfo: false,
        typescriptOnly: false
    };

    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk);
    }
}

function walk(ctx: Lint.WalkContext<void>) {
    function visitNode(node: ts.Node): void {
        if (node.kind === ts.SyntaxKind.NewExpression) {
            const {expression, arguments: args} = node as ts.NewExpression;
            const firstArgument: undefined | ts.Expression = args && args[0];

            if (
                expression &&
                firstArgument &&
                (expression as ts.Identifier).text === 'RegExp' &&
                !stringLiteralKinds.includes(firstArgument.kind)
            ) {
                ctx.addFailureAtNode(node, 'Found non-literal argument to RegExp Constructor');
            }
        }

        return ts.forEachChild(node, visitNode);
    }

    return ts.forEachChild(ctx.sourceFile, visitNode);
}
