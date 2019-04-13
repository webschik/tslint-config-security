import * as Lint from 'tslint';
import * as ts from 'typescript';
import {stringLiteralKinds} from '../node-kind';
import syntaxKindToName from '../syntax-kind-to-name';

export class Rule extends Lint.Rules.AbstractRule {
    static metadata: Lint.IRuleMetadata = {
        ruleName: 'tsr-detect-eval-with-expression',
        description: 'Warns when eval() with non-literal argument is used',
        descriptionDetails: Lint.Utils.dedent`Any usage of eval()
            with non-literal argument will trigger a warning.
            See https://github.com/webschik/tslint-config-security#tsr-detect-eval-with-expression`,
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
        switch (node.kind) {
            case ts.SyntaxKind.CallExpression: {
                const {expression, arguments: args} = node as ts.CallExpression;
                const firstArgument: ts.Expression | undefined = args && args[0];

                if (
                    firstArgument &&
                    (expression as ts.StringLiteral).text === 'eval' &&
                    !stringLiteralKinds.includes(firstArgument.kind)
                ) {
                    ctx.addFailureAtNode(node, `eval with argument of type ${syntaxKindToName(firstArgument.kind)}`);
                }
                break;
            }
            case ts.SyntaxKind.NewExpression: {
                const {expression, arguments: args} = node as ts.NewExpression;

                if (
                    args &&
                    (expression as ts.StringLiteral).text === 'Function' &&
                    args.some((node: ts.Node) => !stringLiteralKinds.includes(node.kind))
                ) {
                    ctx.addFailureAtNode(node, 'Found function constructor with non-literal argument');
                }
                break;
            }
            default:
            //
        }

        return ts.forEachChild(node, visitNode);
    }

    return ts.forEachChild(ctx.sourceFile, visitNode);
}
