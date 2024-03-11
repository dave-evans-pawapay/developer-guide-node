![Header](https://assets-global.website-files.com/62824591015aa314fd308df1/648b073fc8721d39bbdb5a8e_Group%20469-2-p-1600.png)
## Developer guide for using pawaPay API with Node
pawaPay provides a mobile money platform for merchants to incorporate mobile money into their payment flows.  So firstly what is mobile money ?
Mobile money is a platform provided by Mobile Network Operators (MNO) to their customers.  Each customer with a mobile phone is provided with a mobile wallet to hold money.  They can top these wallets using agents to transfer cash into their wallet; or withdraw cash using the same agents.  Recently MNOs have opened up interfaces to their mobile money platforms to enable platforms and merchants to integrate these wallets into their payment flows.
Merchants and payment platforms need establish a commercial wallet (often called a paybill) with each MNO - this facilitates the movement of cash from the consumer wallet into the commercial wallet.  The Merchants and payment platforms must then integrate to each MNOs APIs and go through each of their onboarding and user acceptance tests.
pawaPay has integrated to many of these MNOs in Africa providing a single payment API for merchants to use.  Alongside this API, pawaPay provides a portal for merchants to manage their account across countries and MNO’s and manage all the reconciliation processes required.  When a merchant signs up with pawaPay, pawaPay incorporates their account into pawaPay paybills, enabling the merchant with a single integration to access multiple countries and MNOs.

To see the latest information on which countries pawaPay supports and in-depth API documentation please see this [site](https://www.pawapay.io).  You can sign up for an account [here](https://dashboard.sandbox.pawapay.cloud/#/merchant-signup).

To start the process, pawaPay work with merchant to ensure all the necessary Know Your Customer documents are in place, and provide the merchant with a sandbox to start the integration work.  The sandbox enables you to test out your integration - checking all error responses are handled correctly etc before going live.
This guide will take you step by step through setting up a node / typescript / express server to interact with the pawaPay Merchant API.  We will use simple routing and Pug templates.

Full source code is [here](https://github.com/dave-evans-pawapay/developer-guide-node)

## Step 1: Getting your sandbox credentials
Head to the https://dashboard.sandbox.pawapay.cloud/#/login  and login with your credentials that you setup when you first logged into pawaPay.
![Screenshot-pawapay-login.png](docs%2Fimages%2FScreenshot-pawapay-login.png)
Once you have logged in, you will see the main sandbox customer portal - this is a great place to explore your test transactions as you create them.  However for this we are going to grab our api token.  So click on System Configuration and then API Token

![Screenshot-pawapay-main-screen.png](docs%2Fimages%2FScreenshot-pawapay-main-screen.png)

If you have already generated tokens, you will see your tokens listed.  If not, generate a new one.  You  have a maximum of 2 tokens available.

## Step 2: Setting up your project
This project walk through assumes you have already installed Node and NPM.
Open a terminal, create new directory and change to it

![Screenshot-terminal-1.png](docs%2Fimages%2FScreenshot-terminal-1.png)

Will now initialize the project.  If you do not have node or npm installed - please follow these instructions - Downloading and installing Node.js and npm | npm Docs
To initialise the project type

```
npm init -y
```
and then install the express package, dotenv package for managing configuration variables, body-parser to parse inputs, and nodemon to provide a great development environment.
```angular2html
npm install typescript --save-dev
npm install express dotenv body-parser nodemon
```
![Screenshot-terminal-2.png](docs%2Fimages%2FScreenshot-terminal-2.png)

Next we need to initialise the typescript environment
```angular2html
tsc --init
```
This creates a tsconfig.json file which configures the typescript environment.  We are going to modify this. Use the editor of your choice, popular choices are visualCode or Webstorm.  In this walkthrough we will use visualCode.  Open the directory in VisualCode, and then tsconfig.json
Make the following changes to tsconfig.json
```angular2html
{
  "compilerOptions": {
    "target": "ES2018",                            
    "module": "commonjs",                          
    "moduleResolution": "node",
    "outDir": "./dist",  /* js files lives here */
    "rootDir": "./src",  /* ts file resides here */
    …
    …
}
```
By default when we run tsc command, its compiled js file is created in the same place. Standard practice is having ts and js codes in separate directories
i.e.
src — will contain all ts codes.
dist — will contain js code
This code uses dotenv to read configuration parameters from a .env file
.env
```angular2html
// ./.env
API_KEY=#### Your Key #####
API_URL=https://api.sandbox.pawapay.cloud
PORT=3000
```

We will now write the first node code in Typescript.
src/app.ts (root file)
```angular2html
// src/app.ts
import express from 'express';
const app = express();
app.listen(3000);  // PORT

```
VisualCode will show errors for ‘require’ - this is because we need to install the TypeLibraries for node and express.
In a terminal session type
```angular2html
npm install @types/node
npm install @types/express
```
To test the app.ts, we will set up a start script in the package.json
Open package.json
and update scripts section
```angular2html
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```
Change to
```angular2html
 "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start":"nodemon dist/app.js"
  },
```
And to start the server - in a terminal session
```angular2html
tsc --watch
npm start
```
This will start the server listening on port 3000.  At present it will not return anything.

## Step 3: Building the server
We will now start to build out the server with routes, controllers and views.
Lets start with routes - the routes inform the server how to deal with different URL requests.
create new directory routes in the src directory, and a new file main-routes.ts
```angular2html
// src/routes/main-routes.ts
import { Router } from 'express';

const router = Router();
router.post('/');
router.get('/');
export default router;
```
This will create a basic router that will respond to gets and posts on the '/' url.  We need to now connect this router to the main server file.
Update the app.ts file as below
```angular2html
// src/app.ts

import express, {Request, Response, NextFunction} from 'express';
import router from './routes/main-routes';   // Route connected
const app = express();
app.use('/', mainRoutes);// This means all route path preceed this path

// Below route is trigerred when any error is is thrown
app.use((err: Error, req: Request, res:Response, next: NextFunction) => {
  res.status(500).json({message: err.message});
});
app.listen(3000);
```
These changes imports express, and the new route file we have created.  We tell express to use the mainRoutes routes for top level URL requests - eg http://localhost.  We have also setup a default error handler.
We are now going to build the models for payouts.  The details of the api are available here https://docs.pawapay.co.uk/#tag/deposits.  We will setup 3 models.  The main Deposit model, the Payer and the Address models.  Create a directory in src called models.
Create a new file address.ts
```angular2html
// src/models/address.ts
class Address {
    value: string;

    constructor(value: string){
        this.value = value;
    }
}
```
A new file called payer.ts
```angular2html
// src/models/payer.ts
import {Address} from './index'
class Payer {
    type: string;
    address: Address;

    constructor( type: string, address: Address){
        this.type = type;
        this.address = address;
    }
}
```
A new file called deposit.ts
```angular2html
// src/models/deposit.ts
import {Payer} from './index'
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
        depositId: string,
        amount: string,
        currency: string,
        correspondent: string,
        payer: Payer,
        customerTimestamp: string, 
        statementDescription: string,
        country?: string,
        preAuthorisationCode?: string
        ) {
        this.depositId = depositId;
        this.amount = amount;
        this.currency = currency;
        this.country = country ? country : null;
        this.correspondent = correspondent;
        this.payer = payer;
        this.customerTimestamp = customerTimestamp;
        this.statementDescription = statementDescription;
        this.preAuthorisationCode = preAuthorisationCode ? preAuthorisationCode : null;

    }
}
```
and finally an index.ts file to make importing easy
```angular2html
// src/models/index.ts
export {Payer} from './payer';
export {Address} from './address';
export {Deposit} from './deposit';
```
## Building the order form
We are going to use the mustache template system for the form.  So lets install that dependency
In your terminal, in the project directory type 
```angular2html
npm install mustache-express --save
```
We will now add mustache to our express configuration
In the app.ts code make the following changes.  Also create views subdirectory in the src directory to hold our templates.
```angular2html
// src/app.ts
import express, {Request, Response, NextFunction} from 'express';

// Add this
let mustacheExpress = require('mustache-express');
// End

import mainRoutes from './routes/main-routes';   // Route connected
const app = express();

// Add this
app.set('views', `${__dirname}/views`);
app.set('view engine', 'mustache');
app.engine('mustache', mustacheExpress());
// End

app.use('/', mainRoutes);// This means all route path preceed this path

// Below route is trigerred when any error is is thrown
app.use((err: Error, req: Request, res:Response, next: NextFunction) => {
  res.status(500).json({message: err.message});
});
app.listen(3000);
```
Our build script will not move the mustache templates to the dest output directory, so we need to make some changes to support this.
In your terminal install rimraf and copyfiles
```angular2html
npm install --save-dev rimraf copyfiles
```
Now make changes to build script
```angular2html
{
  "name": "pawapay-node-demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "clear": "rimraf dist/",
    "copy-files": "copyfiles -u 1 src/views/*.mustache dist/",
    "build": "npm run clear && tsc && npm run copy-files",
    "start": "nodemon dist/app.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.5.2",
    "body-parser": "^1.20.2",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "mustache-express": "^1.3.2"
  },
  "devDependencies": {
    "copyfiles": "^2.4.1",
    "nodemon": "^3.0.1",
    "rimraf": "^5.0.1",
    "typescript": "^5.1.6"
  }
}
```
When we do npm run build - this will copy the mustache files to the dest.
Lets now create 3 files in the view subdirectory
```angular2html
// src/views/header.mustache
<!DOCTYPE HTML>
<html>
<head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
    <style>
        .main {
            width: 60%;
            margin: 50px auto 50px auto;
        }
        .countryMno {
            margin-bottom: 0.5rem;
        }
        .panel {
            gap: 100px;
        }
        .panelLabel {
            width: 100px;
        }
    </style>
</head>

<body>
{{#errorMessage}}
    <div class="alert alert-danger" role="alert">
        {{ errorMessage }}
    </div>
{{/errorMessage}}
```
This creates the standard header, imports bootstrap style sheets and adds a few utility classes and a error message section
```angular2html
// src/views/footer.mustache
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossorigin="anonymous"></script>

</body>

</html>
```
This file is the footer on every page which includes the bootstrap script.
The main web page is as follows
```angular2html
// src/views/footer.mustache
{{> header}}

<p>Page content</p>

{{> footer}}
```
And let's wire the controller to use this view.  
```angular2html
// src/controllers/controller.ts
import { RequestHandler } from 'express';
  export const createDeposit:RequestHandler = (req, res, next) => {
    const  body  = req.body;
    return res.status(201).json({message: 'Create Deposit ok'});
  };

  export const depositForm:RequestHandler = (req, res, next) => {
    const  body = req.body;
    res.render('order');
};
```
You will see that the depositForm will render the order template.
In console : 
```angular2html
npm run build
npm start
```
And open http://localhost:3000 and you should see
![Screenshot-blank-page.png](docs%2Fimages%2FScreenshot-blank-page.png)
We will now create the order form.  Create a file in the src/views folder call order.mustache and add the following code
```angular2html
// src/views/order.mustache
{{> header}}
<div class="main">
    <form action="/" method="post">
        <!-- MSISDN input -->
        <div class="d-flex flex-row justify-content-start align-items-center form-outline mb-4 panel">
            <label class="panelLabel" for="msisdn">MSISDN</label>
            <input type="text" name="msisdn" id="msisdn" class="form-control" value="{{msisdn}}"/>
        </div>

        <!-- AMOUNT input -->
            <div class="d-flex flex-row justify-content-start align-items-center form-outline mb-4 panel">
                <label class="panelLabel" for="amount">Amount</label>
                <input type="text" name="amount" id="amount" class="form-control" value="{{amount}}"/>
            </div>

        {{> country-mno }}

        <!-- Statement Description input -->
        <div class="d-flex flex-row justify-content-start align-items-center form-outline mb-4 panel">
            <label class="panelLabel" for="description">Statement Description</label>
            <input type="text" name="description" id="description" maxlength="22" class="form-control" value="{{description}}" />
        </div>

        <!-- Submit button -->
        <button type="submit" class="btn btn-primary btn-block">Deposit</button>
    </form>
</div>


{{> footer}}
```
This includes the header and footer files, and creates the basic form, along with including an additional file for selection of the country and mno.
Create the country-mno.mustache file for the country selection as follows
```angular2html
// src/views/country-mno.mustache
 <!-- Country input -->
  <div class="mb-4 d-flex flex-row justify-content-start align-items-center panel">
        <label class="panelLabel" for="countrySelect">Country</label>
        <select class="form-select" name="country" id="countrySelect" aria-label="Country" onchange="getCounty()">
            <option selected>Choose the country</option>
            <option value="BEN">Benin</option>
            <option value="CMR">Cameroon</option>
            <option value="CIV">Côte d'Ivoire (Ivory Coast)</option>
            <option value="COD">Democratic Republic of the Congo</option>
            <option value="GHA">Ghana</option>
            <option value="KEN">Kenya</option>
            <option value="MWI">Malawi</option>
            <option value="NIG">Nigeria</option>
            <option value="RWA">Rwanda</option>
            <option value="SEN">Sengal</option>
            <option value="TZA">Tanzania</option>
            <option value="UGA">Uganda</option>
            <option value="ZMB">Zambia</option>
        </select>
  </div>

  <div id="BEN" class="countryMno flex flex-row justify-content-start align-items-center panel mb-4" style="display:none;">
    <label class="panelLabel"  for="countrySelect">MNO </label>
    <select class="form-select" name="MNO_BEN" id="MNO_BEN" aria-label="MNO">
        <option selected value="MTN_MOMO_BEN">MTN</option>
    </select>
  </div>
  <div id="CMR" class="countryMno flex flex-row justify-content-start align-items-center panel mb-4" style="display:none;">
      <label class="panelLabel"  for="countrySelect">MNO </label>
          <select class="form-select" name="MNO_CMR" id="MNO_CMR" aria-label="MNO">
            <option selected value="MTN_MOMO_CMR">MTN</option>
            <option value="ORANGE_CMR">Orange</option>
          </select>
  </div>
  <div id="CIV" class="countryMno flex flex-row justify-content-start align-items-center panel mb-4" style="display:none;">
      <label class="panelLabel"  for="countrySelect">MNO </label>
        <select class="form-select" name="MNO_CIV" id="MNO_CIV" aria-label="MNO">
            <option selected value="MTN_MOMO_CIV">MTN</option>
            <option value="ORANGE_CIV">Orange</option>
        </select>
  </div>
    <div id="COD" class="countryMno flex flex-row justify-content-start align-items-center panel mb-4" style="display:none;">
        <label class="panelLabel"  for="countrySelect">MNO </label>
            <select class="form-select" name="MNO_COD" id="MNO_COD" aria-label="MNO">
                <option selected value="VODACOM_MPESA_COD">Vodacom</option>
                <option value="AIRTEL_OAPI_COD">Airtel</option>
                <option value="ORANGE_COD">Orange</option>
            </select>
    </div>
    <div id="GHA" class="countryMno flex flex-row justify-content-start align-items-center panel mb-4" style="display:none;">
        <label class="panelLabel"  for="countrySelect">MNO </label>
            <select class="form-select" name="MNO_GHA" id="MNO_GHA" aria-label="MNO">
                <option selected value="VODAFONE_GHA">Vodafone</option>
                <option value="AIRTELTIGO_GHA">AT</option>
                <option value="MTN_MOBILE_GHA">MTN</option>
            </select>

    </div>
    <div id="KEN" class="countryMno  flex-row justify-content-start align-items-center panel mb-4" style="display:none;">
        <label class="panelLabel"  for="countrySelect">MNO </label>
            <select class="form-select" name="MNO_KEN" id="MNO_KEN" aria-label="MNO">
                <option selected value="MPESA_KEN">MPesa</option>
            </select>

    </div>
    <div id="NIG" class="countryMno  flex-row justify-content-start align-items-center panel mb-4" style="display:none;">
        <label class="panelLabel"  for="countrySelect">MNO </label>
            <select class="form-select" name="MNO_NIG" id="MNO_NIG" aria-label="MNO">
                <option selected value="MTN_MOMO_NIG">MTN</option>
            </select>

    </div>
    <div id="MWI" class="countryMno  flex-row justify-content-start align-items-center panel mb-4" style="display:none;">
        <label class="panelLabel"  for="countrySelect">MNO </label>
            <select class="form-select" name="MNO_MWI" id="MNO_MWI" aria-label="MNO">
                <option selected value="TNM_MWI">TNM</option>
                <option value="AIRTEL_MWI">Airtel</option>
            </select>

    </div>
    <div id="RWA" class="countryMno  flex-row justify-content-start align-items-center panel mb-4" style="display:none;">
        <label class="panelLabel"  for="countrySelect">MNO </label>
            <select class="form-select" name="MNO_RWA" id="MNO_RWA" aria-label="MNO">
                <option selected value="MTN_MOMO_RWA">MTN</option>
                <option value="AIRTEL_RWA">Airtel</option>
            </select>
    </div>
    <div id="SEN" class="countryMno  flex-row justify-content-start align-items-center panel mb-4" style="display:none;">
        <label class="panelLabel"  for="countrySelect">MNO </label>
            <select class="form-select" name="MNO_SEN" id="MNO_SEN" aria-label="MNO">
                <option selected value="FREE_SEN">Free</option>
                <option value="ORANGE_SEN">Orange</option>
            </select>
    </div>
    <div id="TZA" class="countryMno  flex-row justify-content-start align-items-center panel mb-4" style="display:none;">
        <label class="panelLabel"  for="countrySelect">MNO </label>
            <select class="form-select" name="MNO_TZA" id="MNO_TZA" aria-label="MNO">
                <option selected value="AIRTEL_TZA">Airtel</option>
                <option value="VODACOM_TZA">Vodacom</option>
                <option value="TIGO_TZA">Tigo</option>
                <option value="HALOTEL_TZA">Halotel</option>
            </select>
    </div>
    <div id="UGA" class="countryMno  flex-row justify-content-start align-items-center panel mb-4" style="display:none;">
        <label class="panelLabel"  for="countrySelect">MNO </label>
            <select class="form-select" name="MNO_UGA" id="MNO_UGA" aria-label="MNO">
                <option selected value="MTN_MOMO_UGA">MTN</option>
                <option value="AIRTEL_OAPI_UGA">Airtel</option>
            </select>
    </div>
    <div id="ZMB" class="countryMno  flex-row justify-content-start align-items-center panel mb-4" style="display:none;">
        <label class="panelLabel"  for="countrySelect">MNO </label>
            <select class="form-select" name="MNO_ZMB" id="MNO_ZMB" aria-label="MNO">
                <option selected value="MTN_MOMO_ZMB">MTN</option>
                <option value="AIRTEL_OAPI_ZMB">Airtel</option>
            </select>
    </div>
  <script>
   function getCounty(){
    var e = document.getElementById("countrySelect");
    var country = e.value;
    document.getElement
    var countryMno = document.getElementsByClassName('countryMno')
    for (let country of countryMno){
        country.style.display="none";
    }
    document.getElementById(country).style.display="flex";
   }

   for (let option of document.getElementById("countrySelect").options) {
       if (option.value == "{{country}}") {
           option.selected = true;
       } else {
           option.selected = false;
       }
   }
   document.getElementById("{{country}}").style.display = "flex";
   for (let mno_option of document.getElementById("MNO_{{country}}").options) {
        if (mno_option.value == "{{mno}}") {
            mno_option.selected = true;
        } else {
            mno_option.selected = false;
        }
   }
   ;

</script>
```
This file is quite long, as we have coded the countries and the MNO’s - this would normally come from your order form.
We also have some script to only show the MNOs available for each country.
To test this, in your terminal enter
```
npm run build
npm start
```
and in your browser go to http://localhost:3000 and you should see
![Screenshot-browser-3.png](docs%2Fimages%2FScreenshot-browser-3.png)

If you select the country you will see a drop down to select the MNO

![Screenshot-browser-2.png](docs%2Fimages%2FScreenshot-browser-2.png)

## Step 4: Building the form controller
We will now start to build the form handler
So firstly we need to tell express to handle the form data
So in /src/app.ts modify the code to 
```angular2html
// src/app.ts
import express, {Request, Response, NextFunction} from 'express';
let mustacheExpress = require('mustache-express');
import mainRoutes from './routes/main-routes';   // Route connected
const app = express();
app.use(express.urlencoded());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'mustache');
app.engine('mustache', mustacheExpress());

app.use('/', mainRoutes);// This means all route path preceed this path

// Below route is trigerred when any error is is thrown
app.use((err: Error, req: Request, res:Response, next: NextFunction) => {
  res.status(500).json({message: err.message});
});
app.listen(3000);
```
We have added the line app.use(express.urlencoded()); to ensure express can decode the form data.
Now in the src/controllers/controller.ts we handle the form submission
```angular2html
// src/controllers/controller
import { RequestHandler } from 'express';
  export const createDeposit:RequestHandler = (req, res, next) => {
    const  body  = req.body;
    let errorMessage = "";
    let errorFields = [];
    if (!body.msisdn) errorFields.push('MSISDN');
    if (!body.amount) errorFields.push('Amount');
    if (!body.description) errorFields.push('StatementDescription');
    if (errorFields.length > 0) {
      errorMessage = `Please complete ${errorFields.join(', ')} fields`;
    }

    res.render('order', {
      "msisdn": body.msisdn,
      "amount": body.amount,
      "description": body.description,
      "country": body.country,
      "mno": body[`MNO_${body.country}`],
      "errorMessage": errorMessage
    });
  };

  export const depositForm:RequestHandler = (req, res, next) => {
    const  body = req.body;
    res.render('order');
};
```
This will check the required fields and return the error message, if missing.  Also we return the form data, so that this can be displaying the form again.
to test this, in your terminal enter

```angular2html
npm run build
npm start
```
and in your browser go to http://localhost:3000 and you should see
![Screenshot-browser-page-5.png](docs%2Fimages%2FScreenshot-browser-page-5.png)
## Step 5: Building the API Deposit Call to pawaPay
We have now built the basic node application.  So lets connect to pawaPay sandbox, and initiate a mobile money deposit
For this we will use the Axios http request library (many other libraries are available), the UUID library to generate unique IDs, and Luxon Data/Time utilities
In your terminal type
```angular2html
npm install --save axios uuid luxon
npm i --save-dev @types/uuid
```
The pawaPay payment flow is a 2 stage flow.  Firstly the payment is initiated - this submits the payment request to the MNO.  The pawaPay API at this point returns a status and reject reason if applicable - for example MSISDN is not recognised.  The system then waits for the end user to confirm the payment on their phone.  This may take minutes, and in some cases may not complete at all.  To handle this we provide a status API call which provides information on whether the payment has completed.

Set up your .env file with your API Details there is a demo in the repository at .env-demo

```angular2html
// .env
API_KEY=#### Your Key #####
API_URL=https://api.sandbox.pawapay.cloud
```

Lets send the initial deposit request first.
First we will build a simple currency code look up - normally this would be in your e-commerce application as to which currencies you support.  Add the following code into src/controllers/controller.ts
```angular2html
// src/controllers/controller.ts
// ++++
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
// ++++
```
This takes the country chosen in the form and returns the currency code.
We are going to modify the deposit model to incorporate a unique UUID4 deposit id generation - in your system you will normally provide this to track your transactions, and also a default day / time setting.
Update src/models/deposit.ts as follows

```angular2html
// src/models/deposit.ts
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
```
Back in the controller code, we will create a sendDeposit function and incorporate it into the form handling controller.
```angular2html
// src/controllers/controller.ts
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
    // +++ Added this
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
  // ++++ End
  
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
    res.render('order');

};
// +++ Added this
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
// ++++ End
```
These additions create the deposit object from the data provided by the form.  We then submit the deposit to the pawapay API in line 113.  If successful the API return a 200 status, however we need to check the status returned in the data block for whether the transaction has been accepted or not.
We return this status and the failure message if any to the front end and display on the form.  In addition to help debugging we are also returning the depositID used for this transaction
Here are the changes in src/views/header.mustache
```angular2html
<!DOCTYPE HTML>
<html>
<head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
    <style>
        .main {
            width: 60%;
            margin: 50px auto 50px auto;
        }
        .countryMno {
            margin-bottom: 0.5rem;
        }
        .panel {
            gap: 100px;
        }
        .panelLabel {
            width: 100px;
        }
    </style>
</head>

<body>
{{#errorMessage}}
    <div class="alert alert-danger" role="alert">
        {{ errorMessage }}
    </div>
{{/errorMessage}}
<!-- +++ Added additional pawaPay status messages -->
{{#pawaPayMessage}}
    <div class="alert alert-{{pawaPayStatus}}" role="alert">
        {{ pawaPayMessage }}
    </div>
{{/pawaPayMessage}}
{{#depositId}}
    <div class="alert alert-info" role="alert">
        DepositId: {{ depositId }}
    </div>
{{/depositId}}

<!-- End -->
```
We can now run this and check against the pawaPay sandbox.
So rebuild the app and run it
in your terminal enter
```angular2html
npm run build
npm start
```
and in your browser go to http://localhost:3000 and you should see
![Screenshot-browser-6.png](docs%2Fimages%2FScreenshot-browser-6.png)

Lets try this out with a failure condition
For MSISDN use : 243123456031
For amount use : 1000
For Country choose : Democratic Republic of Congo
For MNO choose: Orange
and for statement description enter : Test 12345
Press submit and you should see

![Screenshot-browser-7.png](docs%2Fimages%2FScreenshot-browser-7.png)
You will see that the transaction has been accepted, and the deposit ID returned.
However this does not mean that the payment is confirmed.  In Mobile Money, the end user has to confirm the transaction, so there is a delay in the completion.  We will show how to do this in code shortly , but we can check the transaction in the customer panel.
Let's log into the sandbox customer panel using your provided email and password.  Click on Transactions / Payouts where you will see latest payouts
![Screenshot-browser-8.png](docs%2Fimages%2FScreenshot-browser-8.png)
If we click on the transaction MSISDN we will see the details
![Screenshot-browser-9.png](docs%2Fimages%2FScreenshot-browser-9.png)
Within the Sandbox environment, we can test different countries, MNOs and different error conditions by using different test MSISDNs.  See our API documentation for details.
To check the status of a payment, we will use the /deposits API call.  This can be implemented in two different ways.  The first is as part of the payment submission, we will block return until we receive a response from pawaPay or timeout.  The second is to have the browser check the status.
## Step 6: Checking the status of a payment
In this example we will add the status check to the controller function that is handling the form.  This could equally be done through an AJAX call from the browser to check on the status.
We will create a function to call the deposit API from pawaPay
Add the following function to /src/controllers/controller.ts
```angular2html
// src/controllers/controller.ts

....

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
```
This will call the GET deposit call to return the status.  We will call this using a back off function - so if we do not get completion, then back off a period of time and then resubmit.
To do this we have created a simple blocking function
```angular2html
// src/controllers/controller.ts

.... 

const statusBackOff=[
    0.1,1,15,30,90,180 // Check after 0.1 seconds, 1 second then 15 etc
]

export const sleep = async (seconds: number) => {
    await new Promise(resolve => setTimeout(resolve, seconds*1000));
}
```
We will now incorporate this into the full controller file
```angular2html
// src/controllers/controller.ts
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
    res.render('order');

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
```
This is the controller complete.  We add some additional UI elements to show to the user that the app is working
In src/views/order.mustache we will add a spinner
```angular2html
 <!-- src/views/order.mustache -->
 {{> header}}
<div class="main">
    <form action="/" method="post" id="depositForm">
        <!-- MSISDN input -->
        <div class="d-flex flex-row justify-content-start align-items-center form-outline mb-4 panel">
            <label class="panelLabel" for="msisdn">MSISDN</label>
            <input type="text" name="msisdn" id="msisdn" class="form-control" value="{{msisdn}}"/>
        </div>

        <!-- AMOUNT input -->
            <div class="d-flex flex-row justify-content-start align-items-center form-outline mb-4 panel">
                <label class="panelLabel" for="amount">Amount</label>
                <input type="text" name="amount" id="amount" class="form-control" value="{{amount}}"/>
            </div>

        {{> country-mno }}

        <!-- Statement Description input -->
        <div class="d-flex flex-row justify-content-start align-items-center form-outline mb-4 panel">
            <label class="panelLabel" for="description">Statement Description</label>
            <input type="text" name="description" id="description" maxlength="22" class="form-control" value="{{description}}" />
        </div>

        <!-- Submit button -->
        <button id="submitBtn" type="submit" class="btn btn-primary btn-block">
            <span id="spinner" class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display:none;"></span>
            Deposit</button>
    </form>
</div>


{{> footer}}
```

And in the footer file we will add javascript to disable the submit button and show the spinner
```angular2html
<!-- src/views/footer.mustache

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossorigin="anonymous"></script>
<script>
    let depositForm = document.getElementById("depositForm");
    depositForm.addEventListener("submit", (e) =>
    {
        document.getElementById("submitBtn").disabled=true;
        document.getElementById("spinner").style.display = "inline-block";
    });
</script>
</body>

</html>
```
The app is now pretty well finished.
So if we rebuild and restart the app
in your terminal enter
```angular2html
npm run build
npm start
```
and in your browser go to http://localhost:3000 and you should see
![Screenshot-browser-10.png](docs%2Fimages%2FScreenshot-browser-10.png)
Lets try this out with a failure condition
For MSISDN use : 243123456031
For amount use : 1000
For Country choose : Democratic Republic of Congo
For MNO choose: Orange
and for statement description enter : Test Submission
You will see the spinner and the button is disabled.
![Screenshot-browser-11.png](docs%2Fimages%2FScreenshot-browser-11.png)
You will see the failure condition - in this case incorrect PIN
Also in your console you will see
```
Status Check Log: [{"depositId":"ad36821b-2be3-4dfd-86d0-2161b71aadec","status":"SUBMITTED","requestedAmount":"1000.0000","currency":"CDF","country":"COD","correspondent":"ORANGE_COD","payer":{"type":"MSISDN","address":{"value":"243123456031"}},"customerTimestamp":"2023-08-24T14:07:14Z","statementDescription":"Test Submission","created":"2023-08-24T14:07:14Z"}]
Status Check Log: [{"depositId":"ad36821b-2be3-4dfd-86d0-2161b71aadec","status":"SUBMITTED","requestedAmount":"1000.0000","currency":"CDF","country":"COD","correspondent":"ORANGE_COD","payer":{"type":"MSISDN","address":{"value":"243123456031"}},"customerTimestamp":"2023-08-24T14:07:14Z","statementDescription":"Test Submission","created":"2023-08-24T14:07:14Z"}]
Status Check Log: [{"depositId":"ad36821b-2be3-4dfd-86d0-2161b71aadec","status":"SUBMITTED","requestedAmount":"1000.0000","currency":"CDF","country":"COD","correspondent":"ORANGE_COD","payer":{"type":"MSISDN","address":{"value":"243123456031"}},"customerTimestamp":"2023-08-24T14:07:14Z","statementDescription":"Test Submission","created":"2023-08-24T14:07:14Z"}]
Status Check Log: [{"depositId":"ad36821b-2be3-4dfd-86d0-2161b71aadec","status":"FAILED","requestedAmount":"1000.0000","currency":"CDF","country":"COD","correspondent":"ORANGE_COD","payer":{"type":"MSISDN","address":{"value":"243123456031"}},"customerTimestamp":"2023-08-24T14:07:14Z","statementDescription":"Test Submission","created":"2023-08-24T14:07:14Z","failureReason":{"failureCode":"PAYMENT_NOT_APPROVED","failureMessage":"The customer entered incorrect PIN to authorise the payment."}}]
```
The status checks that were run by the application.
The app is now complete.  You can use this app to test the various country, status codes and returns that the pawaPay sandbox provides.  More complete documentation is available at https://docs.pawapay.co.uk

The complete source code for this walkthrough is https://github.com/dave-evans-pawapay/developer-guide-node
