import { RequestHandler } from 'express';
import axios from 'axios';
import {Deposit} from "../models";

const currencyLookup = {
    "BEN": "XOF",
    "CMR": "XAF",
    "CIV": "XOF",
    "COD": "CDF",
    "GHA": "GHS",
    "KEN": "KES",
    "MWI": "MWK",
    "RWA": "RWF",
    "SEN": "XOF",
    "TZA": "TZS",
    "UGA": "UGX",
    "ZMB": "ZMW"
}

const statusBackOff=[
    0.1,1,15,30,90,180
]

export const createDeposit:RequestHandler = async (req, res, next) => {
    const body = req.body;
    let errorMessage = "";
    let errorFields = [];
    if (!body.msisdn) errorFields.push('MSISDN');
    if (!body.amount) errorFields.push('Amount');
    if (!body.description) errorFields.push('StatementDescription');
    const country = body.country;
    if (!country) errorFields.push('Country');
    if (errorFields.length > 0) {
      errorMessage = `Please complete ${errorFields.join(', ')} fields`;
    }
    // @ts-ignore
    const currency = currencyLookup[country];

    const deposit: Deposit = new Deposit(
        body.amount,
        currency,
        body[`MNO_${body.country}`],
        body.msisdn,
        body.description,
        body.country
    )
    let status = "";
    let message = "";
    try {
      const result = await sendDeposit(deposit)
      switch (result.data.status) {
          case "ACCEPTED":
            status= "success";
            message = "Deposit request sent successfully";
            break;
          case "REJECTED":
            status= "danger";
            message = result.data.rejectionReason.rejectionCode;
            break;
          case "DUPLICATE_IGNORED":
            status= "danger";
            message = "Duplicate request";
            break;
          default:
            status= "danger";
            message = "Unknown error";
            break;
      }
    } catch (error:any) {
        errorMessage = `Error from pawaPay: ${error.message}`;
        status = "danger";
    }
    if (status == "success"){
        status = 'warning';
        message = "Transaction Timeout or Unknown Error";
        for (let i = 0; i < statusBackOff.length; i++) {
            await sleep(statusBackOff[i]);
            try {
                const result = await checkDeposit(deposit)
                console.log(`Status Check Log: ${JSON.stringify(result.data)}`);
                switch (result.data[0].status) {
                    case "COMPLETED":
                        status= "success";
                        message = "Deposit request completed successfully";
                        break;
                    case "SUBMITTED":
                        status = 'warning';
                        message = "Transaction Timeout or Unknown Error";
                        break;
                    case "FAILED":
                        status= "danger";
                        message = result.data[0].failureReason.failureMessage;
                        break;
                    case "ENQUEUED":
                        status= "danger";
                        message = "Transaction enqueued request";
                        break;
                    default:
                        status= "danger";
                        message = "Unknown error";
                        break;
                }
            } catch (error:any) {
                errorMessage = `Error from pawaPay: ${error.message}`;
                status = "danger";
            }
            if (status == "success" || status == "danger"){
                break;
            }
        }
    }

    res.render('order', {
      "msisdn": body.msisdn,
      "amount": body.amount,
      "description": body.description,
      "country": body.country,
      "mno": body[`MNO_${body.country}`],
      "errorMessage": errorMessage,
      "pawaPayStatus": status,
      "pawaPayMessage": message,
      "depositId": deposit.depositId,
    });
  };

  export const depositForm:RequestHandler = (req, res, next) => {
    const  body = req.body;
    res.render('order',{
           "country": "BEN"});

};
export const  sendDeposit = async (deposit: any): Promise<any> =>  {
    const config = {
        headers:{
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.API_KEY}`
        }
    };
    const url = `${process.env.API_URL}/deposits`;
    const dataBlock = {
        depositId: deposit.depositId,
        amount: deposit.amount.toString(),
        currency: deposit.currency,
        correspondent: deposit.correspondent,
        payer : {
            type: deposit.payer.type,
            address: {
                value: deposit.payer.address.value,
            }
        },
        customerTimestamp: deposit.customerTimestamp,
        statementDescription: deposit.statementDescription
    }
    return await axios.post(url,dataBlock,config);
}
export const  checkDeposit = async (deposit: any): Promise<any> =>  {
    const config = {
        headers:{
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.API_KEY}`
        }
    };
    const url = `${process.env.API_URL}/deposits/${deposit.depositId}`;
    return await axios.get(url,config);
}

export const sleep = async (seconds: number) => {
    await new Promise(resolve => setTimeout(resolve, seconds*1000));
}
