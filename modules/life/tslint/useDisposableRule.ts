import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    public static metadata: Lint.IRuleMetadata = {
        ruleName: 'use-disposable',
        type: 'functionality',
        description: 'stuff',
        options: null,
        optionsDescription: '',
        typescriptOnly: true
    };

    public static FAILURE_STRING = 'If dispose() exists, the class should implement Disposable and have a @Disposable decorator.';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new DisposableWalker(sourceFile, this.getOptions()));
    }
}

// The walker takes care of all the work.
class DisposableWalker extends Lint.RuleWalker {
    public visitClassDeclaration(node: ts.ClassDeclaration) {
        const hasDisposableDecorator = this.hasDisposableDecorator(node);
        const hasDisposableInterface = this.hasDisposableInterface(node);
        const hasDisposeMethod = this.hasDisposeMethod(node);
        if ((!hasDisposableDecorator || !hasDisposableInterface || !hasDisposeMethod) && (hasDisposableDecorator || hasDisposableInterface || hasDisposeMethod))
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        super.visitClassDeclaration(node);
    }

    hasDisposableDecorator(node: ts.ClassDeclaration) {
        const decorators: ts.Decorator[] = node.decorators || [];
        const className = node.name!.text;
        return !!decorators.map((d: any) => d.expression.text || (d.expression.expression || {}).text).find(t => t === 'Disposable');
    }

    hasDisposableInterface(node: ts.ClassDeclaration) {
        // @todo need to look down inheritence also

        let interfaces: any[] = [];
        if (node.heritageClauses) {
            const interfacesClause = node.heritageClauses.filter(h => h.token === ts.SyntaxKind.ImplementsKeyword);
            if (interfacesClause.length !== 0)
                interfaces = interfacesClause[0].types.map((t: any) => t.expression && t.expression.name ? t.expression.name.text : t.expression.text);
        }
        return interfaces.indexOf('Disposable') !== -1;
    }

    hasDisposeMethod(node: ts.ClassDeclaration) {
        return !!node.members.find((m: ts.MethodDeclaration) => {
            if (m.kind !== ts.SyntaxKind.MethodDeclaration)
                return false;
            return m.name.getText() === 'dispose';
        });
    }
}
