# Implementation Engineer Assessment

## Installation

This repo already includes the `node_modules` directory, so no installation is needed.

## Usage

For this to be tested local, there are a few items you must have:

1. A machine with [Node.js](https://nodejs.org/en/download/) installed

2. Adyen API key with correct permissions: you can find information on that [here](https://docs.adyen.com/development-resources/api-credentials#generate-api-key)

3. Client Key: you can find out how to create them [here](https://docs.adyen.com/development-resources/client-side-authentication#how-it-works)

Once you have these items, create a file in the root directory called `.env`. Use the template in `env_example` to create the keys and add the appropriate values.

_Note: the format should be `KEY=VALUE` with **NO SPACES** between the `=` and the values._

Now that these items are ready, you can start the application by `cd` into this directory and using

```
$ npm run start
```
