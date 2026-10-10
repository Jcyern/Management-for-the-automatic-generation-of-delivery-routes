import { InstanceLoader } from '@nestjs/core/internal';
export class TestingInstanceLoader extends InstanceLoader {
    async createInstancesOfDependencies(modules = this.container.getModules(), mocker) {
        this.injector.setContainer(this.container);
        mocker && this.injector.setMocker(mocker);
        await super.createInstancesOfDependencies();
    }
}
