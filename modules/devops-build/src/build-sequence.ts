import { DotnetBuildAllActivity } from './activities/dotnet-build-all-activity';
import { DotnetRestoreAllActivity } from './activities/dotnet-restore-all-activity';
import { DotnetTestActivity } from './activities/dotnet-test-activity';
import { InstallNpmActivity } from './activities/install-npm-activity';
import { NgTestActivity } from './activities/ng-test-activity';
import { NgBuildActivity } from './activities/ng-build-activity';
import { NgLintActivity } from './activities/ng-lint-activity';
import { ProjectContainer } from './project-container';
import { Activity } from './activity';
import { ActivitySequence } from './activity-sequence';
import { DotnetPublishActivity } from './activities/dotnet-publish-activity';
// import { PublishTestResultsActivity } from './activities/publish-test-results-activity';
import { DockerBuildActivity } from './activities/docker-build-activity';
import { DockerPushActivity } from './activities/docker-push-activity';
// import { DockerRmiActivity } from './activities/docker-rmi-activity';
// import { DockerTagActivity } from './activities/docker-tag-activity';
import { KubernetesApplyActivity } from './activities/kubernetes-apply-activity';
import * as minimist from 'minimist';
import * as path from 'path';

export class BuildSequence extends ActivitySequence {
    constructor(root: string, containerRegistry: string) {
        super('Build');
        const args = minimist(process.argv.slice(2));
        const skipnpm = args.skipnpm === true || args.skipnpm && args.skipnpm.toLowerCase() === 'true';
        const test = args.test === true || args.test && args.test.toLowerCase() === 'true';
        const publish = args.publish === true || args.publish && args.publish.toLowerCase() === 'true';
        const deploy = args.deploy === true || args.deploy && args.deploy.toLowerCase() === 'true';
        const buildnumber = args.buildnumber && args.buildnumber.toString().toLowerCase();
        const environment = args.environment ? `-${args.environment.toLowerCase()}` : '';
        if (deploy && !buildnumber)
            throw new Error('A buildnumber must be supplied to version the docker images');

        const projectContainer = new ProjectContainer(root);
        // if (!skipnpm) {
        //     this.add(new InstallNpmActivity(projectContainer.root));
        // }
        this.add(new NgBuildActivity(projectContainer.root, undefined, true));
        this.add(new NgLintActivity(projectContainer.root, undefined, true));
        // this.add(projectContainer.ngPublicWebs.map(d => new NgBuildActivity(projectContainer.root, this.getNameFromFolder(d), true)));
        // this.add(new DotnetRestoreAllActivity(projectContainer.root));
        // this.add(new DotnetBuildAllActivity(projectContainer.root));
        if (test)
            this.add([<Activity>new NgTestActivity(projectContainer.root)].concat(projectContainer.csharpTests.map(d => new DotnetTestActivity(d)).concat()));
        // if (publish)
           // this.add(projectContainer.publicWebs.map(d => <Activity>new DotnetPublishActivity(d)).concat([new PublishTestResultsActivity(projectContainer.root)]));
        // if (deploy) {
        //     const sites = projectContainer.publicWebs.map((d, i) => { return {
        //         path: d,
        //         name: `${this.getNameFromFolder(d)}`.toLowerCase()
        //     }; });
        //     this.add(sites.map(s => <Activity>new DockerBuildActivity(s.path, `${containerRegistry}/${s.name}${environment}:${buildnumber}`)));
        //     // this.add(sites.map(s => <Activity>new DockerTagActivity(s.path, `${containerRegistry}/${s.name}`, buildnumber, environment)));
        //     this.add(sites.map(s => <Activity>new DockerPushActivity(s.path, `${containerRegistry}/${s.name}${environment}:${buildnumber}`)));
        //     // this.add(sites.map(s => <Activity>new DockerPushActivity(s.path, `${containerRegistry}/${s.name}:${environment}`)));
        //     // this.add(sites.map(s => <Activity>new DockerRmiActivity(s.path, `${containerRegistry}/${s.name}:${environment}`)));
        //     this.add(sites.map(s => <Activity>new KubernetesApplyActivity(s.path, `${s.name}${environment}`)));
        // }
    }

    private getNameFromFolder(directory: string) {
        return path.basename(directory).toLowerCase().replace(/\./gm, '-');
    }

    async runAsync() {
        if (await super.runAsync())
            return true;
        for (const failed of this.failed) {
            console.log('**************');
            console.log(`Full logs for failed activity ${failed.toString()}`);
            console.log('**************');
            console.log('');
            failed.log.writeAll();
            console.log('**************');
            console.log(`End logs for ${failed.toString()}`);
            console.log('**************');
            console.log('');
        }
        return false;
    }
}
