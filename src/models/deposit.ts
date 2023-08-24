import {Address, Payer} from './index'
import { v4 as uuidv4 } from 'uuid';
const { DateTime } = require("luxon");
export class Deposit {
    depositId: string;  // UUIDv4 36 character string
    amount: string; 
    currency: string; // ISO 4217 3 character currency code
    country: string | null;
    correspondent: string // MNO Identifier
    payer: Payer;
    customerTimestamp: string // date-time to RFC3339 section 5.6
    statementDescription: string // 22 characters
    preAuthorisationCode: string | null // 36 characters

    constructor(
        amount: string,
        currency: string,
        correspondent: string,
        msisdn: string,
        statementDescription: string,
        country?: string,
        preAuthorisationCode?: string
        ) {
        const address = new Address(msisdn);
        this.payer = new Payer('MSISDN', address);
        this.depositId = uuidv4();
        this.amount = amount;
        this.currency = currency;
        this.country = country ? country : null;
        this.correspondent = correspondent;
        this.customerTimestamp = DateTime.now().toISO();
        this.statementDescription = statementDescription;
        this.preAuthorisationCode = preAuthorisationCode ? preAuthorisationCode : null;
    }
}
