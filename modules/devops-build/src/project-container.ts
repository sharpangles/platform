import * as glob from 'glob';
import * as path from 'path';

export class ProjectContainer {
    constructor(root: string) {
        this.root = path.resolve(root);
        this.typescriptRoot = path.resolve(this.root, './');
        // this.typescriptRoot = path.resolve(this.root, 'Typescript');
        // this.csharpRoot = path.resolve(this.root, 'CSharp');
        // this.csharpProjects = glob.sync(path.resolve(this.csharpRoot, './*/*/*/*/') + '/');
        // this.publicWebs = glob.sync(path.resolve(this.csharpRoot, './*/*/sys/*.PublicWeb') + '/');
        // this.ngPublicWebs = this.publicWebs.filter(d => glob.sync(d + '/package.json').length > 0);
        // this.csharpTests = glob.sync(path.resolve(this.csharpRoot, './*/*/test/*') + '/');
        // this.typescriptProjects = glob.sync(path.resolve(this.typescriptRoot, 'modules/*') + '/');
        // this.npmProjects = this.typescriptProjects.concat(this.ngPublicWebs);
        // this.mainNgCliProject = path.resolve(this.typescriptRoot, 'modules/cli-proj');
    }

    publicWebs: string[];
    csharpProjects: string[];
    csharpTests: string[];
    ngPublicWebs: string[];
    // typescriptProjects: string[];
    // npmProjects: string[];
    root: string;
    typescriptRoot: string;
    csharpRoot: string;
    // mainNgCliProject: string;
}
