function _traverse<T>(node: T, childrenSelector: (node: T) => T[], func: (node: T) => void, visitedStack?: Set<T>) {
    if (visitedStack) {
        if (visitedStack.has(node))
            throw new Error('Cyclical features.');
        visitedStack.add(node);
    }
    func(node);
    let children = childrenSelector(node);
    if (children && children.length !== 0) {
        for (let child of children)
            _traverse(child, childrenSelector, func, visitedStack);
    }
    if (visitedStack)
        visitedStack.delete(node);
}

export function traverse<T>(node: T, childrenSelector: (node: T) => T[], func: (node: T) => void) {
    _traverse<T>(node, childrenSelector, func, new Set<T>());
}
