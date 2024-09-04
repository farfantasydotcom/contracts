require("@nomicfoundation/hardhat-toolbox");

require('hardhat-contract-sizer');
require("hardhat-tracer");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-web3");
require("@atixlabs/hardhat-time-n-mine");
require('hardhat-storage-layout');
//require('hardhat-ethernal');
require("hardhat-gas-reporter");


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  //ethernal: {
  //  apiToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJlYmFzZVVzZXJJZCI6IndKR1BQS2lFeVpQOERXMGExZkxYdXlvMHo2czIiLCJhcGlLZXkiOiI4Vlk2NDVGLUZFUjQwMTQtUVFUWUpaQy1TUlIxUTlIXHUwMDAxIiwiaWF0IjoxNzA3ODkwMTg4fQ.d0hVKK-Q_U6hBLG6DAgBrcHtDgrYSV-AnmfUvbSPYUY"
  //},
  uploadAst: true,
  gasReporter: {
    currency: 'USD',
    gasPrice: 31,
    enabled: true,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  optimizer: {
    enabled: true,
    runs: 200
  }

};