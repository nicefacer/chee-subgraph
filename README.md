# Chee-Subgraph

[Chee](https://chee.finance/) is an open-source protocol for algorithmic, efficient Money Markets on Celo. This Subgraph ingests the contracts of Chee protocol.

## Networks and Performance

This subgraph can be found on The Graph Hosted Service at https://thegraph.com/explorer/subgraph/cheeprotocol/chee-subgraph.

You can also run this subgraph locally, if you wish. Instructions for that can be found in [The Graph Documentation](https://thegraph.com/docs/quick-start).

### ABI

The ABI used is `ctoken.json`. It is a stripped down version of the full abi provided by Chee, that satisfies the calls we need to make for both cCELO and cBEP20 contracts. This way we can use 1 ABI file, and one mapping for cCELO and cBEP20.

## Getting started with querying

Below are a few ways to show how to query the Chee V2 Subgraph for data. The queries show most of the information that is queryable, but there are many other filtering options that can be used, just check out the [querying api](https://github.com/graphprotocol/graph-node/blob/master/docs/graphql-api.md).

You can also see the saved queries on the hosted service for examples.

### How To Deploy To Thegraph
 
 1. Get your wallet (Metamask, photon etc) ready and ensure you have Arbitrum token(ARB) for gass fee and GRT token for signal.
 2. Visit [Thegraph](https://thegraph.com), Click Graph Explorer and select subgraph studio. It will load subgrpah studio and you connect your wallet and signed it.
 3. As you connected, click on create Subgraph. Fill the forms like naming your subgraph and your information and create the studio subgraph.
 4. Now, on your VSCode, get your terminal and follow the steps below:
     
        a.)  Install Graph CLI using NPM: You can install Graph CLI with either npm or yarn using this command:

            ``` npm install -g @graphprotocol/graph-cli ```
            Install Graph CLI using Yarn
            ```yarn global add @graphprotocol/graph-cli```


        b.)    Initialize your Subgraph with this command:

           ```graph init chee-finance```(this should be the name you gave above)

        c.) Authenticate within the CLI

            ```graph auth` (••••••••••••••••••••••••••••••••)```. You will see your own auth code in your studio

        d.) Enter Subgraph

             ```cd chee-finance```(this should be the name you gave above)
        
        e.) Build Subgraph

                ```graph codegen && graph build```

        f.)  Deploy Subgraph

             ```graph deploy chee-finance```