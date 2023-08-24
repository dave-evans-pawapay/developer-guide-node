## Developer guide for using pawaPay API with Node
pawaPay provides a mobile money platform for merchants to incorporate mobile money into their payment flows.  So firstly what is mobile money ?
Mobile money is a platform provided by Mobile Network Operators (MNO) to their customers.  Each customer with a mobile phone is provided with a mobile wallet to hold money.  They can top these wallets using agents to transfer cash into their wallet; or withdraw cash using the same agents.  Recently MNOs have opened up interfaces to their mobile money platforms to enable platforms and merchants to integrate these wallets into their payment flows.
Merchants and payment platforms need establish a commercial wallet (often called a paybill) with each MNO - this facilitates the movement of cash from the consumer wallet into the commercial wallet.  The Merchants and payment platforms must then integrate to each MNOs APIs and go through each of their onboarding and user acceptance tests.
pawaPay has integrated to many of these MNOs providing a single payment API for merchants to use.  Alongside this API, pawaPay provides a portal for merchants to manage their account across countries and MNO’s and manage all the reconciliation processes required.  When a merchant signs up with pawaPay, pawaPay incorporates their account into pawaPay paybills, enabling the merchant with a single integration to access multiple countries and MNOs.
To start the process, pawaPay work with merchant to ensure all the necessary Know Your Customer documents are in place, and provide the merchant with a sandbox to start the integration work.  The sandbox enables you to test out your integration - checking all error responses are handled correctly etc before going live.
This guide will take you step by step through setting up a node / typescript / express server to interact with the pawaPay Merchant API.  We will use simple routing and Pug templates.
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


