import { DataType } from './decorators/data_type';
import { Bus } from '@sharpangles/ops';

export class OpsPackage {
    dataTypes?: Iterable<DataType>;
    busses?: Iterable<Bus>;
    arrangers?: Iterable<Arranger>;
}
