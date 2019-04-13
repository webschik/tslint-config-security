import * as Lint from 'tslint';
import * as ts from 'typescript';
import {stringLiteralKinds} from '../node-kind';

export class Rule extends Lint.Rules.AbstractRule {
    static metadata: Lint.IRuleMetadata = {
        ruleName: 'tsr-detect-non-literal-require',
        description: 'Warns when require() function is used with non-literal argument',
        descriptionDetails: Lint.Utils.dedent`Any usage of require()
            with non-literal argument will trigger a warning.
            See https://github.com/webschik/tslint-config-security#tsr-detect-non-literal-require`,
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
        if (node.kind === ts.SyntaxKind.CallExpression) {
            const {expression, arguments: args} = node as ts.CallExpression;
            const firstArgument: undefined | ts.Expression = args && args[0];

            if (
                expression &&
                firstArgument &&
                (expression as ts.Identifier).text === 'require' &&
                !stringLiteralKinds.includes(firstArgument.kind)
            ) {
                ctx.addFailureAtNode(node, 'Found non-literal argument in require');
            }
        }

        return ts.forEachChild(node, visitNode);
    }

    return ts.forEachChild(ctx.sourceFile, visitNode);
}
