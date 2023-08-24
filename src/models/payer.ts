import {Address} from './index'
export class Payer {
    type: string;
    address: Address;

    constructor( type: string, address: Address){
        this.type = type;
        this.address = address;
    }
}