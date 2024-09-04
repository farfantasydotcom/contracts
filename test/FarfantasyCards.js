//const { expect } = require("chai");


const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
require("@nomiclabs/hardhat-web3");
const hre = require("hardhat");
const _ = require('underscore');



describe("Farkeys", function() {


  let fid;


  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;
  let addr5;
  let addr6;
  let addr7;
  let addr8;
  let addrs;

  let protocolFeeAddress = '0x073BFad76740A9A778BE9B2F3f5E3e95c94D961a'
  let zeroAddress = '0x0000000000000000000000000000000000000000';



  const decStr = "000000000000000000";
  const blnbln = "1000000000000000000";

  const protocolFeePercent = "20000000000000000" // protocolFeePercent subjectFeePercent
  const subjectFeePercent = "20000000000000000"

  const delay = ms => new Promise(res => setTimeout(res, ms));



  //Deploy the token 
  before(async function() {



      [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, ...addrs] = await ethers.getSigners(25);

      diffAccounts = await ethers.getSigners(25);



      Fidaddress = await ethers.getContractFactory("Fidaddress");

      Farkeys = await ethers.getContractFactory("FarfantasyCards");

      ERC20 = await ethers.getContractFactory("ERC20");

      FarfantasyDeck3 = await ethers.getContractFactory("FarfantasyDeck");

      FFTTSS1 = await ethers.getContractFactory("FFTTSSOne");

      fidaddress = await Fidaddress.deploy();

      var degenSupply = 1000000000000000 + decStr
      degen = await ERC20.deploy("Degen Coin", "DEGEN", 18, degenSupply);
      ourcoin = await ERC20.deploy("Our Coin", "OUR", 18, degenSupply);
      farkeys = await Farkeys.deploy(fidaddress.target, degen.target);


      farfantasyDeck3 = await FarfantasyDeck3.deploy(farkeys.target);

      ffttss1 = await FFTTSS1.deploy(degen.target, farkeys.target);


      console.log("FID Deployed at ::", fidaddress.target);
      console.log("farkeys Deployed at ::", farkeys.target);
      console.log("Degen Deployed at ::", degen.target);
      console.log("Our Coin Deployed at ::", ourcoin.target);
      console.log("FarfantasyDeck3 Deployed at ::", farfantasyDeck3.target);
      console.log("FFTTSS1 Deployed at ::", ffttss1.target);

      console.log();
      console.log();
      console.log();
      console.log();
  });

  async function pricestatus(supply, amount, fid = 0, title = "") {

      var price = 0;
      var buy_price = 0;
      var sell_price = 0;
      var buy_price_after = 0;
      var sell_price_after = 0;
      try {
          price = await farkeys.connect(addr1).getPrice(supply, amount);
      } catch (e) {}

      try {
          buy_price = await farkeys.connect(addr1).getBuyPrice(fid, amount);
      } catch (e) {}

      try {
          sell_price = await farkeys.connect(addr1).getSellPrice(fid, amount);
      } catch (e) {}

      try {
          buy_price_after = await farkeys.connect(addr1).getBuyPriceAfterFee(fid, amount);
      } catch (e) {}

      try {
          sell_price_after = await farkeys.connect(addr1).getSellPriceAfterFee(fid, amount);
      } catch (e) {}

      console.log("====================================");
      console.log("Title :: ", title);
      console.log("Price :: ", price, web3.utils.fromWei(price.toString()));

      console.log("Buy Price :: ", buy_price.toString(), web3.utils.fromWei(buy_price.toString()));
      console.log("Sell Price :: ", sell_price.toString(), web3.utils.fromWei(sell_price.toString()));
      console.log("Buy Price After Fee :: ", buy_price_after.toString(), web3.utils.fromWei(buy_price_after.toString()));
      console.log("Sell Price After Fee :: ", sell_price_after.toString(), web3.utils.fromWei(sell_price_after.toString()));
      console.log();
      console.log();
      console.log();
      console.log();
  }


  
  function bondingFarkey(ExistingSupply, amount = 1) {
    var _sum = ExistingSupply + amount;
    var _sqrt = Math.sqrt(_sum);
    var _value = parseInt(_sqrt * _sum) + 250;
    return _value;
  }

  function sqrtt(supply, amount = 1, constt = 10) {
    var asas = (supply + amount)// * constt;
    sque = Math.sqrt(asas);
    //console.log("Sque :: ", asas, sque, parseInt(sque * asas));
    var asa = parseInt(sque * asas) + 1000;
    
    return asa;
    
  }

    function price_sum1(supply, amount){
        //console.log("Supply :: ", supply, amount);
        return (supply == 0 ? 0 : (supply - 1 ) * (supply) * (2 * (supply - 1) + 1));
    }   

    function price_sum2(supply, amount){
        return (supply == 0 && amount == 1 ? 0 : (supply - 1 + amount) * (supply + amount) * (2 * (supply - 1 + amount) + 1)) / 6;
    }


    function nth_price(n){
        return (n * n * 6) + 500;
    }

    function ffttss_price(FreeDecks = 1, DeckCounts = 0, DeckInitialPrice = 1000, PriceIncrement = 1000) {
        if(DeckCounts < FreeDecks) {
            return 0;
        }
        return DeckInitialPrice + (DeckInitialPrice * PriceIncrement * (DeckCounts - FreeDecks) / 10000);
    }

  describe("Setup the Farkeys", async function() {


      it("Keys should not buyable if there is no degen tokens.", async function() {

          //await farkeys.connect(owner).setDegenContract(degen.target);
          await farkeys.connect(owner).setFarcasterIDContract(fidaddress.target);

          //Whitelist few fids 
          var fids = _.range(1, 30);
          await farkeys.connect(owner).whitelistFids(fids);

          var supply = await degen.totalSupply();

          //transfer some degen tokens to addr2
          var _value = "5000" + decStr;
          //var send = await degen.connect(owner).transfer(addr2.address, _value);
            

            //Approve the degen token to farkeys contract
            var approve = await degen.connect(addr2).approve(farkeys.target, _value);

            //Get the supply of the degen tokens
            

          //Transfer some deg

          var buy = farkeys.connect(addr2).buyCards(1, 1);
          var restex = await expect(buy).to.be.reverted;
      });

      it("Send some degen tokens to addr1", async function() {
          var _value = "500000";
          var send = await degen.connect(owner).transfer(addr1.address, _value);
          var balance = await degen.balanceOf(addr1.address);
          await expect(balance).to.equal(_value);
          //console.log("Balance of addr1 :: ", balance.toString());

          //Approve the degen token to farkeys contract
          //console.log(farkeys.target, _value);
          var approve = await degen.connect(addr1).approve(farkeys.target, _value);
          var allowance = await degen.allowance(addr1.address, farkeys.target);
          await expect(allowance).to.equal(_value);

          //console.log("Allowance of addr1 :: ", allowance.toString(), _value);  



      });
  });

  describe("Fill FIDs", async function() {
      it("Check if the Fid can be stored in Fid contract", async function() {

          for (let adr in diffAccounts) {

              var _index = parseInt(adr) + 1;


              //console.log("Address :: ", adr, diffAccounts[adr].address);
              const addr1FarkeysBalance = await fidaddress.addFid(_index, diffAccounts[adr].address);
              const _Address = await fidaddress.custodyOf(_index)
              //console.log("Address :: ", _Address);
              //console.log("Address ---  :: ", _Address, adr + 1);
              await expect(_Address).to.equal(diffAccounts[adr].address);
          }

      });

      it("Bulk FID Mapping", async function() {
          var fids = _.range(100, 230);
          var size_fids = fids.length;
          var addresses = [];

          for(let i = 0; i < size_fids; i++){
              addresses.push(diffAccounts[10].address);
          }

      

          const addr1FarkeysBalance = await fidaddress.addFids(fids, addresses);

          for(let i = 0; i < size_fids; i++){
              const _Address = await fidaddress.custodyOf(fids[i]);
              await expect(_Address).to.equal(diffAccounts[10].address);


          }
          
      });

  });

  describe("Setup the FarShares", async function() {
      it("Setup the IDregistor", async function() {
          const addr1FarkeysBalance = await farkeys.setFarcasterIDContract(fidaddress.target);
          var idregister = await farkeys.FarcasterID();
          await expect(idregister).to.equal(fidaddress.target);


          //set the protocol fee address  
          const addr1FarkeysBalance2 = await farkeys.setFeeDestination(protocolFeeAddress);
          var protocolFeeDestination = await farkeys.protocolFeeDestination();
          await expect(protocolFeeAddress).to.equal(protocolFeeDestination);

      });

      it("Whitelisting is important", async function() {
          const addr1FarkeysBalance = farkeys.connect(addr2).buyCards(32, 1);
          var restex = await expect(addr1FarkeysBalance).to.be.revertedWith("Not whitelisted");

          var fids = _.range(1, 130);
          await farkeys.connect(owner).whitelistFids(fids);

          //whitelistFids
      });

      it("Get the first Share of first FID", async function() {

          var _balance_check_addresses = [
              diffAccounts[0].address, //first FID owner 
              addr2.address, //First Buyer 
              farkeys.target, //Contract Address
              protocolFeeAddress, //Protocol Fee Address
          ];

          var token_amount = "10000" + decStr;
            var send = await degen.connect(owner).transfer(addr2.address, token_amount);


          //get the subject fees of given address 

          var ETH_balances = {};
          for (let adr in _balance_check_addresses) {


              //Get the degen balance of the address
              let balance = await degen.connect(owner).balanceOf(_balance_check_addresses[adr]);

              ETH_balances[_balance_check_addresses[adr]] = {
                  before: balance.toString(),
                  after: 0
              };
          }

          var subject_fees = await farkeys.subjectFees(diffAccounts[0].address);
          ETH_balances[(diffAccounts[0].address + "_iw")] = {
              before: subject_fees.toString(),
              after: 0
          };

          //var accasdasd = await web3.eth.getAccounts()
          //console.log()
          let balance_before = await degen.connect(owner).balanceOf(addr2.address);


          var supply = await farkeys.connect(addr1).totalSupply(1);
          await expect(supply).to.equal(0);

          
          /*
          var _value_Degen = "1000";
          //Transfer the degen tokens to the buyer
          var send = await degen.connect(owner).transfer(addr2.address, _value_Degen);

          var approve = await degen.connect(addr2).approve(farkeys.target, _value_Degen);
          var allowance = await degen.allowance(addr2.address, farkeys.target);
          await expect(allowance).to.equal(_value_Degen);

          //Buy the tickets
          var pay = await farkeys.connect(addr2).buyPremium(degen.target, _value_Degen);
          */

          

          const addr1FarkeysBalance = await farkeys.connect(addr2).buyCards(1, 1);



          //event Trade(address trader, address fid_address, bool isBuy, uint256 fid, 
          //uint256 shareAmount, uint256 ethAmount, uint256 protocolEthAmount, 
          //uint256 subjectEthAmount, uint256 supply);
          //event Withdrawn(address account, uint256 amount);

          //get the price for the share
          var price = await farkeys.connect(addr1).getPrice(1, 1);


          //protocolFeePercent subjectFeePercent blnbln
          //uint256 protocolFee = price * protocolFeePercent / 1 ether;

          price = new BN(price);
          //console.log("Price of the share", price.toString());
          var bn_protocolFeePercent = new BN(protocolFeePercent);
          var bn_blnbln = new BN(blnbln);
          var protocolEthAmount = price.mul(bn_protocolFeePercent).div(bn_blnbln);

          //Calculate the fee for subject 
          var subjectEthAmount = price.mul(new BN(subjectFeePercent)).div(bn_blnbln);

            //console.log("Protocol Fee :: ", protocolEthAmount.toString());
            //console.log("price--- Fee :: ", price.toString());

          var what = await expect(addr1FarkeysBalance).to.emit(farkeys, 'Trade')
              .withArgs(addr2.address, diffAccounts[0].address, true, 1, 1, price.toString(),
                  protocolEthAmount.toString(), 2);


          supply = await farkeys.connect(addr1).totalSupply(1);
          await expect(supply).to.equal(2);

          var keysupply = await farkeys.connect(addr2).balanceOf(addr1.address, 1)
          await expect(keysupply).to.equal(0);


          var keysupply_for_fid = await farkeys.connect(addr2).balanceOf(diffAccounts[0].address, 1)
          await expect(keysupply_for_fid).to.equal(1);

          let balance_after = await degen.connect(owner).balanceOf(addr2.address);


          //Check the before and after balance of fid owner, contract balance, protocol fee, subject fee and buyer fees 
          var _log_table = [];

          var subject_fees = await farkeys.subjectFees(diffAccounts[0].address);
          //ETH_balances[diffAccounts[0].address]['after'] = subject_fees.toString()


          for (let adr in ETH_balances) {

              try {
                  balance = await degen.connect(owner).balanceOf(adr);
                  ETH_balances[adr]['after'] = balance.toString()
              } catch (e) {
                  //console.log("Error in getting balance for ", adr);
              }


              var _log_table_row = {
                  'address': adr,
                  'before': ETH_balances[adr]['before'],
                  'after': ETH_balances[adr]['after'],
              }

              if (adr == diffAccounts[0].address + "_iw") {
                  _log_table_row['after'] = subject_fees.toString();

              }

              _log_table.push(_log_table_row);
          }
          //console.table( _log_table);

          const addr1FarkeysBalance2 = await farkeys.connect(addr2).buyCards(1, 1);


      });

      


      it("Should able to transfer Keys", async function() {

          var rest = farkeys.connect(addr2).safeTransferFrom(diffAccounts[0].address, diffAccounts[1].address, 1, 1, "0x00");
          var restex = await expect(rest).to.be.reverted

          var keysupply_for_fid = await farkeys.connect(addr2).balanceOf(diffAccounts[0].address, 1)
          await expect(keysupply_for_fid).to.equal(1);

          var keysupply_for_fid = await farkeys.connect(addr2).balanceOf(addr2.address, 1)
          await expect(keysupply_for_fid).to.equal(2);

          var rest = farkeys.connect(addr2).safeTransferFrom(addr2.address, diffAccounts[1].address, 1, 1, "0x00");

          //TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
          var what = await expect(rest).to.emit(farkeys, 'TransferSingle')
              .withArgs(addr2.address, addr2.address, diffAccounts[1].address, 1, 1);


          var keysupply_for_fid = await farkeys.connect(addr2).balanceOf(addr2.address, 1)
          await expect(keysupply_for_fid).to.equal(1);

          var keysupply_for_fid = await farkeys.connect(addr2).balanceOf(diffAccounts[0].address, 1)
          await expect(keysupply_for_fid).to.equal(1);

          var keysupply_for_fid = await farkeys.connect(addr2).balanceOf(diffAccounts[1].address, 1)
          await expect(keysupply_for_fid).to.equal(1);



          //addr2

      })



      it("Should able to buy bulk Keys", async function() {
          var fids = [
              2, 3, 4, 5, 6, 7, 8, 9, 10, 11
          ]
          var amounts = [
              1, 1, 1, 1, 1, 1, 1, 1, 1, 1
          ];

          var amounts10 = [
              10, 10, 10, 10, 10, 10, 10, 10, 10, 10
          ];

          


          //Transfer more debg to the buyer
          var _value = "10000000000" + decStr;
          var approve = await degen.connect(addr2).approve(farkeys.target, _value);
          var send = await degen.connect(owner).transfer(addr2.address, _value);
          
          //Give approval to the contract
          var approve = await degen.connect(addr2).approve(farkeys.target, _value);

          var buybulk = farkeys.connect(addr2).buyCardsBulk(fids, amounts);
          var what = await expect(buybulk).to.emit(farkeys, 'Trade')

          //var restex = await expect(buybulk).to.be.revertedWith("Insufficient tickets");

          var _value = "10000000000" + decStr;
          var approve = await degen.connect(addr1).approve(farkeys.target, _value);
          var send = await degen.connect(owner).transfer(addr1.address, _value);
          
          //Give approval to the contract
          var approve = await degen.connect(addr1).approve(farkeys.target, _value);

          var buybulk1 = farkeys.connect(addr1).buyCardsBulk(fids, amounts10);
          var what1 = await expect(buybulk1).to.emit(farkeys, 'Trade')


      });

      it("Should able to sell", async function() {

          //Get the NFT balance of the address
          var keysupply_for_fid1 = await farkeys.connect(addr2).balanceOf(addr2.address, 1)

          var sellPrice = await farkeys.connect(addr1).getSellPrice(1, 1);

          //console.log("Sell Price :: ", sellPrice.toString(), web3.utils.fromWei(sellPrice.toString()));

          var sell = farkeys.connect(addr2).sellCards(1, 1);

          //get the price for the share
          //protocolFeePercent subjectFeePercent blnbln
          //uint256 protocolFee = price * protocolFeePercent / 1 ether;

          sellPrice = new BN(sellPrice);
          //console.log("Price of the share", price.toString());
          var bn_protocolFeePercent = new BN(protocolFeePercent);
          var bn_blnbln = new BN(blnbln);
          var protocolEthAmount = sellPrice.mul(bn_protocolFeePercent).div(bn_blnbln);

          //Calculate the fee for subject 

          var subjectEthAmount = sellPrice.mul(new BN(subjectFeePercent)).div(bn_blnbln);


          var what = await expect(sell).to.emit(farkeys, 'Trade')
              .withArgs(addr2.address, diffAccounts[0].address, false, 1, 1, sellPrice.toString(),
                  protocolEthAmount.toString(), 2);

          var keysupply_for_fid2 = await farkeys.connect(addr2).balanceOf(addr2.address, 1)
          keysupply_for_fid1 = parseInt(keysupply_for_fid1.toString());
          keysupply_for_fid2 = parseInt(keysupply_for_fid2.toString());
          await expect(keysupply_for_fid1).to.equal(keysupply_for_fid2 + 1);

          for (let i in diffAccounts) {
              var keysupply_for_fid = await farkeys.connect(addr2).balanceOf(diffAccounts[i].address, 1)
              //console.log("Balance of ", diffAccounts[i].address, keysupply_for_fid.toString());
          }

          var sellPrice = await farkeys.connect(addr1).totalSupply(1);

      });


      it("Check the Balance after sales", async function() {

          //transfer some degen tokens to addr10
            var _value = "10000000000" + decStr;
            var send = await degen.connect(owner).transfer(diffAccounts[10].address, _value);
            var approve = await degen.connect(diffAccounts[10]).approve(farkeys.target, _value);

            var send = await degen.connect(owner).transfer(diffAccounts[11].address, _value);
            var approve = await degen.connect(diffAccounts[11]).approve(farkeys.target, _value);


          var fid = 10;
          //Buy a share
          var buy = await farkeys.connect(diffAccounts[10]).buyCards(fid, 1);
          var supply = await farkeys.connect(addr1).totalSupply(1);

          //Check the buy price after fees 
          var buy_price_after = await farkeys.connect(addr1).getBuyPriceAfterFee(fid, 300);
          //console.log("Buy Price After Fee :: ", buy_price_after.toString(), web3.utils.fromWei(buy_price_after.toString()));

          //Another use buys 1000 shares 
          var buy = await farkeys.connect(diffAccounts[11]).buyCards(fid, 300);

          //console.log("Supply :: ", supply.toString());

          //ETH balance of the first user 
          //Get the degen wallet balance of the first user
          let balance_before = await degen.connect(owner).balanceOf(diffAccounts[10].address);

          //First user sells 1 shares
          var sell = await farkeys.connect(diffAccounts[10]).sellCards(fid, 1);

          //ETH balance of the first user
          let balance_after = await degen.connect(owner).balanceOf(diffAccounts[10].address);
          //Check the balance of the first user
      });

      

  });

  describe("Operations", async function() {
    var _balance = "10055000"



    
    

    it("Check the Keys balance of the contracts", async function() {
        //whitelist the fids 
        var fids = [300, 301, 302]
        await farkeys.connect(owner).whitelistFids(fids);

        var buybulk = await farkeys.connect(addr1).buyCardsBulk(fids, [1, 1, 1]);

        var keysupply = await farkeys.connect(addr2).balanceOf(farkeys.target, 300)
        //await expect(keysupply).to.equal(1);
        await expect(keysupply).to.equal("1");

        

        //map the fid address
        var mapped = await fidaddress.addFid(300, addr8.address);
        var _Address = await fidaddress.custodyOf(300)
        await expect(_Address).to.equal(addr8.address);
    });
    it("Non owners should not withdraw the first key ", async function() {

        var keysupply = await farkeys.connect(addr2).balanceOf(addr8.address, 300)
        await expect(keysupply).to.equal(0);


        var withdraw =  await farkeys.connect(addr8).withdrawFirstKey(300)
        //await expect(withdraw).to.be.revertedWith("Invalid User");

        var keysupply = await farkeys.connect(addr2).balanceOf(farkeys.target, 300)
        await expect(keysupply).to.equal(0);        

        var keysupply = await farkeys.connect(addr2).balanceOf(addr8.address, 300)
        //console.log("Key Supply :: ", keysupply.toString());
        await expect(keysupply).to.equal(1);         
        
        
        var withdraw =  await expect(farkeys.connect(addr8).withdrawFirstKey(300)).to.be.revertedWith("Already withdrawn");

    });

    it("Non owner should not withdraw the subject fees", async function() {
      //get the number of shares of a fid 
      var keysupply = await farkeys.connect(addr2).totalSupply(2)
      //console.log("Key Supply :: ", keysupply.toString());

      //GEt the fid of an address
      var custodyAddress = await fidaddress.custodyOf(2);
      //console.log("Custody Address :: ", custodyAddress);

      var address1supply = await farkeys.connect(addr2).balanceOf(addr1, 2)
      //console.log("Key Supply :: ", addr1.address, address1supply.toString());

      var subjectFees = await farkeys.connect(addr2).subjectFees(2);
      //console.log("Subject Fees :: ", ethers.utils.fromWei(subjectFees.toString()));

      let balance_before_addr2 = await web3.eth.getBalance(addr2.address);
      var wrongWithdraw =  await expect(farkeys.connect(addr2).withdrawSubjectFees(2)).to.be.revertedWith("Invalid User");
      let balance_after_addr2 = await web3.eth.getBalance(addr2.address);
      
      
      //console.log("Balance Before :: ", balance_before_addr2);
      //console.log("Balance Aftere :: ", balance_after_addr2);

      let balance_before_addr1 = await web3.eth.getBalance(addr1.address);
      var wrongWithdraw =  await expect(farkeys.connect(addr1).withdrawSubjectFees(2)).emit(farkeys, 'Withdrawn').withArgs(addr1.address, subjectFees);
      let balance_after_addr1 = await web3.eth.getBalance(addr1.address);

      //console.log("Balance Before :: ", balance_before_addr1);
      //console.log("Balance Aftere :: ", balance_after_addr1);
      //console.log("Subject Feesee :: -------", subjectFees);


      //await expect(balance_before_addr2).to.equal(balance_after_addr2);

      //get the ether balance of the address
      
      
    });


  });

  describe("Pricing Stuffs Hacked ", async function() {

    it("Check the price of the shares", async function() {

        var supply = 1;

        //Whitelist an ID 
        var fids = 123232
        await farkeys.connect(owner).whitelistFids([fids]);

        var amounts = [1,2,3,4,5,6,7,8,9,10]
        for(let i = 0; i < amounts.length; i++) {
            var total_supply = supply + amounts[i];
            //var price = await farkeys.connect(addr1).getPrice(supply, amounts[i]);

            //Get the buy price of a card 
            //var buy_price = await farkeys.connect(addr1).getBuyPrice(fids, amounts[i]);

            //console.log("Price :: ", amounts[i], total_supply, (total_supply * total_supply * 6), nth_price(total_supply), web3.utils.fromWei(price.toString()), web3.utils.fromWei(buy_price.toString()));
        }

        var amount = 2;
        
        //console.log("Price :: ", );
    });
  });

  
  describe("Fantasy", async function() {
    it("User without NFT should not able to move in to the contract", async function() {
        var _keys = [2,3,4,5,6]
        var _amount = [1,1,1,1,1]
        var trying2Buy = farfantasyDeck3.connect(addr5).transferKeysIn(_keys, _amount);
        await expect(trying2Buy).to.be.reverted;
        var approveIt = await farkeys.connect(addr5).setApprovalForAll(farfantasyDeck3.target, true);
        //await expect(approveIt).to.be.reverted;
        var trying2Buy2 =  farfantasyDeck3.connect(addr5).transferKeysIn(_keys, _amount);
        await expect(trying2Buy2).to.be.reverted;

    });
    it("User with NFTs should able to move in to the contract", async function() {
        var _keys = [2,3,4,5,6]
        var _amount = [1,1,1,1,1]
        var trying2Buy =  farfantasyDeck3.connect(addr2).transferKeysIn(_keys, _amount);
        await expect(trying2Buy).to.be.reverted;
        var approveIt = await farkeys.connect(addr2).setApprovalForAll(farfantasyDeck3.target, true);

        for(let i = 0; i < _keys.length; i++) {
            var balace_before = await farkeys.balanceOf(addr2.address, _keys[i]);

            var balace_before_contract = await farkeys.balanceOf(farfantasyDeck3.target, _keys[i]);
            var trying2Buy2 =  await farfantasyDeck3.connect(addr2).transferKeysIn([_keys[i]], [1]);
            var balace_after = await farkeys.balanceOf(addr2.address, _keys[i]);
            var balace_after_contract = await farkeys.balanceOf(farfantasyDeck3.target, _keys[i]);
            await expect(balace_before + balace_before_contract).to.be.equal(balace_after + balace_after_contract);
            //console.log("Key :: ", i, _keys[i], balace_before, balace_before_contract, balace_after, balace_after_contract);

            var amount = await farfantasyDeck3.cardsBalances(addr2.address, _keys[i]);
            await expect(amount).to.equal(1);
            //await expect(balace_before).to.be.equal(balace_after_contract);
        }

    });    
    it("Non Owners should not able to withdraw the cards", async function() {
        var _keys = [2,3,4,5,6]
        var _amount = [1,1,1,1,1]        
        var withdraw_wrong = farfantasyDeck3.connect(addr1).transferKeysOut(_keys, _amount);
        await expect(withdraw_wrong).to.be.revertedWith("Not enough Cards");
    });        
    it("Owners should able to withdraw the cards", async function() {
        var _keys = [2,3,4,5,6]
        
        for(let i = 0; i < _keys.length; i++) {

            var balace_before = await farkeys.balanceOf(addr2.address, _keys[i]);
            var balace_before_contract = await farkeys.balanceOf(farfantasyDeck3.target, _keys[i]);
            var withdraw = await farfantasyDeck3.connect(addr2).transferKeysOut([_keys[i]], [1]);
            var balace_after = await farkeys.balanceOf(addr2.address, _keys[i]);
            var balace_after_contract = await farkeys.balanceOf(farfantasyDeck3.target, _keys[i]);
            await expect(balace_before + balace_before_contract).to.be.equal(balace_after + balace_after_contract);
        }


    });
    it("Owners should not able to withdraw the cards with more than they own", async function() {

        var _keys = [2,3,4,5,6]
        var _amount = [2,2,2,2,2]        
        var withdraw_wrong = farfantasyDeck3.connect(addr2).transferKeysOut(_keys, _amount);
        await expect(withdraw_wrong).to.be.revertedWith("Not enough Cards");
    });

    it("Should not able to create deck without cards", async function() {
        var _keys = [2,3,4]//,5,6]
        var approveIt = await farkeys.connect(addr3).setApprovalForAll(farfantasyDeck3.target, true);
        var create_deck = farfantasyDeck3.connect(addr3).mint(_keys);
        await expect(create_deck).to.be.reverted;
    });

    it("Should be able to create deck from inventory", async function() {
        var _keys = [2,3,4,5,6]
        var _amount = [1,1,1,1,1]
        var trying2Buy = await farfantasyDeck3.connect(addr2).transferKeysIn(_keys, _amount);

        for(let i = 0; i < _keys.length; i++) {
            var amount = await farfantasyDeck3.cardsBalances(addr2.address, _keys[i]);
            await expect(amount).to.equal(1);
            var balace = await farkeys.balanceOf(addr2.address, _keys[i]);
            //console.log("Balace :: ",_keys[i], balace.toString());

        }   

        var create_deck = farfantasyDeck3.connect(addr2).mint(_keys);
        await expect(create_deck).to.emit(farfantasyDeck3, 'Deck').withArgs(0, addr2.address, 1, _keys);

        var _deck = await farfantasyDeck3.connect(addr2).getDeckFids(1);
        var deck_int = [];
        for(let _id in _deck){
            deck_int[_id] = parseInt(_deck[_id]);
        }
        await expect(deck_int).to.be.deep.equal(_keys);


        for(let i = 0; i < _keys.length; i++) {
            var balace = await farkeys.balanceOf(farfantasyDeck3.target, _keys[i]);

            var amount = await farfantasyDeck3.cardsBalances(farfantasyDeck3.target, _keys[i]);
            await expect(amount).to.equal(balace);
            //console.log("Balace :: ",_keys[i], balace.toString(), amount.toString());   
        }

        var tryWithdraw = farfantasyDeck3.connect(addr2).transferKeysOut(_keys, _amount);
        await expect(tryWithdraw).to.be.revertedWith("Not enough Cards");

        var _owner_1 = await farfantasyDeck3.connect(addr2).ownerOf(1);
        await expect(_owner_1).to.be.equal(addr2.address);

    });

    it("Deck can be passed to another user", async function() {
        //Transfer the nft to another user
        var transfer = farfantasyDeck3.connect(addr2).safeTransferFrom(addr2.address, addr3.address, 1);
        await expect(transfer).to.emit(farfantasyDeck3, 'Transfer').withArgs(addr2.address, addr3.address, 1);
        var _owner_1 = await farfantasyDeck3.connect(addr2).ownerOf(1);
        await expect(_owner_1).to.be.equal(addr3.address);

        //Check the deck of the new owner
        var transfer = farfantasyDeck3.connect(addr3).safeTransferFrom(addr3.address, addr2.address, 1);
        await expect(transfer).to.emit(farfantasyDeck3, 'Transfer').withArgs(addr3.address, addr2.address, 1);
        var _owner_1 = await farfantasyDeck3.connect(addr2).ownerOf(1);
        await expect(_owner_1).to.be.equal(addr2.address);
    });

    it("Deck Edit Error checks", async function() {
        var wrongEditOwner = farfantasyDeck3.connect(addr3).dkEdit(1, [2,3,4,5,6]);
        await expect(wrongEditOwner).to.be.revertedWith("Denied");

        var wrongEditOwner = farfantasyDeck3.connect(addr2).dkEdit(1, []);
        await expect(wrongEditOwner).to.be.revertedWith("0 Keys");

        var wrongEditOwner = farfantasyDeck3.connect(addr2).dkEdit(1, [2,3,4,5,6,7]);
        await expect(wrongEditOwner).to.be.revertedWith("Over Supply");

        var wrongEditOwner = farfantasyDeck3.connect(addr2).dkEdit(1, [1,1,1]);
        await expect(wrongEditOwner).to.be.revertedWith("Not Unique");        


        var editDeck = farfantasyDeck3.connect(addr2).dkEdit(1, [17,8,9,0,120]);
        await expect(editDeck).to.be.reverted;


    });

    it("Deck Edit", async function() {
        var _keys = [2,3,4,5,6]
        var _new_cards = [7,8,9,0,0]

        var balances = {};
        balances['before'] = {};

        //Get the inventory of the user for old keys 
        for(let i = 0; i < _keys.length; i++) {
            balances['before'][i] = {};
            //console.log(i, _keys[i], _new_cards[i])
            balances['before'][i]['amount_old_users'] = await farfantasyDeck3.cardsBalances(addr2.address, _keys[i]);
            balances['before'][i]['amount_old_contract'] = await farfantasyDeck3.cardsBalances(farfantasyDeck3.target, _keys[i]);
            balances['before'][i]['amount_old_wallet'] = await farkeys.balanceOf(addr2.address, _keys[i]);
            balances['before'][i]['amount_new_users'] = await farfantasyDeck3.cardsBalances(addr2.address, _new_cards[i]);
            balances['before'][i]['amount_new_contract'] = await farfantasyDeck3.cardsBalances(farfantasyDeck3.target, _new_cards[i]);
            balances['before'][i]['amount_new_wallet'] = await farkeys.balanceOf(addr2.address, _new_cards[i]);



            //console.log("Amount :: ", _keys[i], amount_old_users.toString(), amount_old_contract.toString(), amount_old_wallet.toString(), _new_cards[i], amount_new_users.toString(), amount_new_contract.toString(), amount_new_wallet.toString());
        }

        var editDeck = await farfantasyDeck3.connect(addr2).dkEdit(1, _new_cards);
        //await expect(editDeck).to.emit(farfantasyDeck3, 'Deck').withArgs(1, addr2.address, 1, [2,3,4]);
        var deck_aftere = await farfantasyDeck3.getDeckFids(1);
        //console.log("Deck old :: ", _keys);
        //console.log("Deck New :: ", _new_cards);
        //console.log("Deck Before :: ", deck_before);
        //console.log("Deck Aftere :: ", deck_aftere);
        
        balances['after'] = {};
        //Get the inventory of the user for old keys 
        for(let i = 0; i < _keys.length; i++) {
            //console.log(i, _keys[i], _new_cards[i])
            balances['after'][i] = {};


            balances['after'][i]['amount_old_users'] = await farfantasyDeck3.cardsBalances(addr2.address, _keys[i]);
            balances['after'][i]['amount_old_contract'] = await farfantasyDeck3.cardsBalances(farfantasyDeck3.target, _keys[i]);
            balances['after'][i]['amount_old_wallet'] = await farkeys.balanceOf(addr2.address, _keys[i]);
            balances['after'][i]['amount_new_users'] = await farfantasyDeck3.cardsBalances(addr2.address, _new_cards[i]);
            balances['after'][i]['amount_new_contract'] = await farfantasyDeck3.cardsBalances(farfantasyDeck3.target, _new_cards[i]);
            balances['after'][i]['amount_new_wallet'] = await farkeys.balanceOf(addr2.address, _new_cards[i]);
        }

        for(let i = 0; i < _keys.length; i++) {
            var _after = balances['after'][i]['amount_old_users'] + balances['after'][i]['amount_old_contract'] + balances['after'][i]['amount_old_wallet'];
            var _before = balances['before'][i]['amount_old_users'] + balances['before'][i]['amount_old_contract'] + balances['before'][i]['amount_old_wallet'];;
            await expect(_after).to.be.equal(_before);

            _after = balances['after'][i]['amount_new_users'] + balances['after'][i]['amount_new_contract'] + balances['after'][i]['amount_new_wallet'];
            _before = balances['before'][i]['amount_new_users'] + balances['before'][i]['amount_new_contract'] + balances['before'][i]['amount_new_wallet'];;
            await expect(_after).to.be.equal(_before);

            //await expect(balances['before'][i]['amount_old_users']).to.be.equal(balances['after'][i]['amount_new_users']);
        }
    });

    it("Deck Move", async function() {
        var falseTry = farfantasyDeck3.connect(addr4).safeTransferFrom(addr4.address, addr3.address, 1);
        await expect(falseTry).to.be.reverted;

        //falseTry = await farfantasyDeck3.connect(addr2).safeTransferFrom(addr2.address, addr3.address, 3);
        var owner_3 = await farfantasyDeck3._ownerOf(3);
        //await expect(falseTry).to.be.reverted;

        //Transfer the deck to another user
        var transfer = farfantasyDeck3.connect(addr2).safeTransferFrom(addr2.address, addr3.address, 1);
        await expect(transfer).to.emit(farfantasyDeck3, 'Transfer').withArgs(addr2.address, addr3.address, 1);

        var _new_cards = [9, 0, 0, 7, 8]
        var editDeck =  farfantasyDeck3.connect(addr2).dkEdit(1, _new_cards);
        await expect(editDeck).to.be.revertedWith("Denied");

        var deck = await farfantasyDeck3.getDeckFids(1);
        var editDeck =  await farfantasyDeck3.connect(addr3).dkEdit(1, _new_cards);
        await expect(editDeck).to.emit(farfantasyDeck3, 'Deck').withArgs(1, addr3.address, 1, _new_cards);
        //await expect(editDeck).to.be.revertedWith("Denied");

        var owner_3 = await farfantasyDeck3.getDeckFids(1);
    });

    it("Deck Burn", async function() {
        //non owner should not able to burn the deck
        var burn = farfantasyDeck3.connect(addr2).burn(1, false);
        await expect(burn).to.be.revertedWith("Denied");

        var initial = await farfantasyDeck3.getDeckFids(1);

        var result = {
            "before": {},
            "after": {}
        };

        for(let i = 0; i < initial.length; i++) {
            result['before'][i] = {};
            result['before'][i]['balace_user'] = await farfantasyDeck3.cardsBalances(addr3.address, initial[i]);
            result['before'][i]['balace_contract'] = await farfantasyDeck3.cardsBalances(farfantasyDeck3.target, initial[i]);
            result['before'][i]['balace_wallet'] = await farkeys.balanceOf(addr3.address, initial[i]);
        }

        var burn = await farfantasyDeck3.connect(addr3).burn(1, true);
        var owner_3 = await farfantasyDeck3.getDeckFids(1);

        //Should not able to burn the same deck again
        var burn = farfantasyDeck3.connect(addr3).burn(1, true);
        await expect(burn).to.be.revertedWith("Denied");

        var owner_3 = await farfantasyDeck3.getDeckFids(1);

        for(let i = 0; i < initial.length; i++) {
            result['after'][i] = {};
            result['after'][i]['balace_user'] = await farfantasyDeck3.cardsBalances(addr3.address, initial[i]);
            result['after'][i]['balace_contract'] = await farfantasyDeck3.cardsBalances(farfantasyDeck3.target, initial[i]);
            result['after'][i]['balace_wallet'] = await farkeys.balanceOf(addr3.address, initial[i]);

        }        

        for(let i = 0; i < initial.length; i++) {
            var _after = result['after'][i]['balace_user'] + result['after'][i]['balace_contract'] + result['after'][i]['balace_wallet'];// + 1n;
            var _before = result['before'][i]['balace_user'] + result['before'][i]['balace_contract'] + result['before'][i]['balace_wallet'];;
            await expect(_after).to.be.equal(_before);

        }

        //var burn = farfantasyDeck3.connect(addr3).burn(1);
        //await expect(burn).to.emit(farfantasyDeck3, 'Burn').withArgs(1, addr3.address);
        //var owner_3 = await farfantasyDeck3._ownerOf(1);
        //await expect(owner_3).to.be.equal();

    });

    it("Single Step Stuff", async function() {
        var items = [22,23,24,25,26]

        //check the supply 
        for(let i = 0; i < items.length; i++) {
            var supply = await farkeys.totalSupply(items[i]);
            //console.log("Supply :: ", items[i], supply.toString());
        }

        //Top up the user8 with degen tokens
        var _value = "10000000000" + decStr;
        var send = await degen.connect(owner).transfer(addr8.address, _value);
        var approve = await degen.connect(addr8).approve(farkeys.target, _value);
        var approve = await degen.connect(addr8).approve(farfantasyDeck3.target, _value);


        //var mint2 = farfantasyDeck3.connect(addr8).mint2(items);
        //await expect(mint2).to.emit(farfantasyDeck3, 'Transfer');
        //await expect(mint2).to.be.revertedWith("Insufficient payment");

        console.log();
        console.log();

        var deckID = await farfantasyDeck3.deckID();
        var deck = await farfantasyDeck3.getDeckFids(deckID - 1n);

        var ownerOf = await farfantasyDeck3._ownerOf(deckID - 1n);
        
        //await expect(addr8.address).to.be.deep.equal(ownerOf);



        for(let i = 0; i < items.length; i++) {
            var supply = await farkeys.totalSupply(items[i]);
            //under contarct inventory 
            var balance_contract = await farkeys.balanceOf(farfantasyDeck3.target, items[i]);
            var balance_contract_key = await farkeys.balanceOf(farkeys.target, items[i]);
            var balance_buyer = await farkeys.balanceOf(addr8.address, items[i]);

            var balance_inventory_user = await farfantasyDeck3.cardsBalances(addr8.address, items[i]);
            var balance_inventory_contract = await farfantasyDeck3.cardsBalances(farfantasyDeck3.target, items[i]);

            
            //console.log("Supply :: ", items[i], supply.toString(), balance_contract.toString(),balance_contract_key.toString(), balance_buyer.toString(), balance_inventory_user.toString(), balance_inventory_contract.toString());

        }        

        //var burn = await farfantasyDeck3.connect(addr8).burn(2, true);
        var owner_3 = await farfantasyDeck3.getDeckFids(2);

        for(let i = 0; i < items.length; i++) {
            var balance_buyer = await farkeys.balanceOf(addr8.address, items[i]);
            //await expect(balance_buyer).to.be.equal(1);
        }



    });

    it("Price Calculatore", async function() {

    
             
        
    });

});

describe("Post Degen Stuffs", async function() {
    it("Test Degen Wallet", async function() {
        //load some degen token into the user wallet user9
        var _value = "10000" + decStr;
        //Get the degen token balance of address 9 
        var _balance_before = await degen.balanceOf(diffAccounts[9].address);
        
        var send = await degen.connect(owner).transfer(diffAccounts[9].address, _value);

        var _balance_after = await degen.balanceOf(diffAccounts[9].address);

        await expect(_balance_after).to.be.equal(_balance_before + _value);

        var _topup1 = farkeys.connect(diffAccounts[9]).topupDegenWallet(_value);
        await expect(_topup1).to.be.reverted;



        //Approve the degen token spend to the contract
        var approve = await degen.connect(diffAccounts[9]).approve(farkeys.target, _value);

        var _topup = await farkeys.connect(diffAccounts[9]).topupDegenWallet(_value);

        var _balance = await farkeys.degenWallet(diffAccounts[9].address);
        await expect(_balance).to.be.equal(_value);

        //Users without degen balance should be reverted 
        var _withdraw = farkeys.connect(diffAccounts[10]).withdrawDegenWallet(_value);
        await expect(_withdraw).to.be.revertedWith("Insufficient funds");

        //Eligible user can withdraw some fund 
        var _value2 = "100" + decStr
        //Get the balance if user before withdrawal 
        var _balance_wallet_before = await degen.balanceOf(diffAccounts[9].address);
        var _balance_inventry_before = await farkeys.degenWallet(diffAccounts[9].address);

        
        var _withdraw2 = farkeys.connect(diffAccounts[9]).withdrawDegenWallet(_value2);
        await expect(_withdraw2).to.emit(farkeys, 'Withdrawn').withArgs(diffAccounts[9].address, _value2);


        //Balance after 
        var _balance_wallet_after = await degen.balanceOf(diffAccounts[9].address);
        var _balance_inventry_after = await farkeys.degenWallet(diffAccounts[9].address);

        await expect(_balance_wallet_after + _balance_inventry_after).to.be.equal(_balance_wallet_before + _balance_inventry_before)


    });

    
    it("Wallet, inventory, contract, fees balance after before buy / sell", async function() {
        var fid_new = 434; 
        var keys = 10;

        //Test if the protocol fees are aadding up 
        var protocolFeeDestination = await farkeys.protocolFeeDestination();
        var protocolFee_before = await farkeys.degenWallet(protocolFeeDestination);        

        await farkeys.connect(owner).whitelistFids([fid_new]);
        const address_17_fid_new = await fidaddress.addFid(fid_new, diffAccounts[17].address);


        //get the address of the fid 
        var _Address = await fidaddress.custodyOf(fid_new);
        await expect(_Address).to.equal(diffAccounts[17].address);

        //Get the balance of address 17 
        var user_17_wallet_balance = await degen.balanceOf(diffAccounts[17].address)
        await expect(user_17_wallet_balance).to.equal(0);

        
        var user_13_wallet_balance = await degen.balanceOf(diffAccounts[13].address)
        await expect(user_13_wallet_balance).to.equal(0);
        
        //Get the balance in the contract inventory of the user 17
        var user_17_inventory_balance = await farkeys.degenWallet(diffAccounts[17].address)
        await expect(user_17_inventory_balance).to.equal(0);

        //Get the balance in the contract inventory of the user 13
        var user_13_inventory_balance = await farkeys.degenWallet(diffAccounts[13].address)
        await expect(user_13_inventory_balance).to.equal(0);


        //transfer 1mn degen token to user 13 
        var _value_init = "1000000" + decStr
        await degen.connect(owner).transfer(diffAccounts[13].address, _value_init);
        var user_13_wallet_balance_before = await degen.balanceOf(diffAccounts[13].address)
        await expect(user_13_wallet_balance_before).to.equal(_value_init);

        var buy_price = await farkeys.connect(owner).getPrice(1,10);

        //Fees calculator 
        var __fees = await farkeys.connect(owner).fees();
        __fees = new BN(__fees);
        var bn_buy_price = new BN(buy_price);
        var _fees_ = bn_buy_price.mul(__fees).div(new BN(10000));

        //console.log("Buy Price :: ", buy_price.toString(), _fees_.toString());

        //Buy 10 keys of fid new 
        await degen.connect(diffAccounts[13]).approve(farkeys.target, _value_init);
        var buykeys = farkeys.connect(diffAccounts[13]).buyCards(fid_new, keys);
        await expect(buykeys).to.emit(farkeys, 'Trade')
            .withArgs(
                    diffAccounts[13].address, 
                    diffAccounts[17].address, 
                    true, 
                    fid_new, 
                    keys, 
                    buy_price, 
                    _fees_.toString(),
                11);


        //Get the balance of address 13
        var nft_balance = await farkeys.balanceOf(diffAccounts[13], fid_new);
        await expect(nft_balance).to.equal(keys);

        //Get the degen balacnce of the user 13 
        var user_13_wallet_balance_after = await degen.balanceOf(diffAccounts[13].address)
        //await expect(user_13_wallet_balance_after).to.be.equal(0);

        var decStrBN = new BN("1000000000000000000");


        var bn_buy_price_ = new BN(buy_price);
        var bn_buy_price = bn_buy_price_.div(decStrBN);


        var _fees_percent = await farkeys.connect(owner).fees();
        var bn_fees_percent = new BN(_fees_percent);
        //bn_fees_percent = bn_fees_percent.mul(new BN(100));

        var _fees = bn_buy_price_.mul(bn_fees_percent).div(new BN(10000));
        _fees = _fees.mul(new BN(2)).div(decStrBN);



        var bn_user_13_wallet_balance_after = new BN(user_13_wallet_balance_after);
        bn_user_13_wallet_balance_after = bn_user_13_wallet_balance_after.div(decStrBN);  


        var bn_user_13_wallet_balance_before = new BN(user_13_wallet_balance_before); 
        bn_user_13_wallet_balance_before = bn_user_13_wallet_balance_before.div(decStrBN);  

        
            
        var int_balance_with_user = parseInt(bn_user_13_wallet_balance_after.toString());
        var int_buy_price = parseInt(bn_buy_price.toString());
        var int_fees = parseInt(_fees.toString());

        var int_balance_user_initial = parseInt(bn_user_13_wallet_balance_before.toString());

        var _After_effect = int_balance_with_user + int_buy_price + int_fees;

        console.log("Before and after :: ", int_balance_user_initial, _After_effect);

        if((int_balance_user_initial > _After_effect - 10) && (int_balance_user_initial < _After_effect + 10)) {
            await expect(1).to.be.equal(1);
        }else 
        {
            await expect(int_balance_user_initial).to.be.equal(int_balance_with_user + int_buy_price + int_fees);
        }


        var _supply = [
            1,2,3,4,5,6,7,8,9, 10,11, 20,25,30,40,50,60,70,80,90,100,
            150,200,250,300,400,500,600,700,800,900,1000,
            1500,2000,2500,3000,4000,5000,6000,7000,8000,9000,10000,
            15000,20000,25000,30000,40000,50000,60000,70000,80000,90000,100000

        ]

        for(let i of _supply) {
            //var buyprice = await farkeys.getPrice(i,1)
            //var buyprice2 = await farkeys.getPrice(2,i)
            //var bn_buyprice = new BN(buyprice);
            //var bn_buyprice2 = new BN(buyprice2);
            //console.log(i, bn_buyprice.div(decStr).toString(), bn_buyprice2.div(decStr).toString());

        }

        var subjectFee = await farkeys.subjectFees(fid_new);
        var bn_subjectFee = new BN(subjectFee);
        bn_subjectFee = bn_subjectFee.div(decStrBN);
        bn_subjectFee = parseInt(bn_subjectFee.toString());
        //console.log("Subject Fee :: ", bn_subjectFee.toString());
        //console.log("Subject Fee :: ", bn_subjectFee);  
        await expect(bn_subjectFee * 2).to.be.equal(int_fees);

        //Test if the protocol fees are aadding up 
        var protocolFee_after = await farkeys.degenWallet(protocolFeeDestination);

        var bn_protocolFee_before = new BN(protocolFee_before);
        var bn_protocolFee_after = new BN(protocolFee_after);
        bn_protocolFee_before = bn_protocolFee_before.div(decStrBN);
        bn_protocolFee_after = bn_protocolFee_after.div(decStrBN);

        //Make sure the protocol fee is added up
        await expect(bn_protocolFee_after).to.be.equal(bn_protocolFee_before.add(new BN(bn_subjectFee)));

        //console.log("Protocol Fee :: ", bn_protocolFee_before.toString(), bn_protocolFee_after.toString());

    });

    it("Protocol Fees Withdrawal", async function() {
        //Get the protocol fee destination address 
        var protocolFeeDestination = await farkeys.protocolFeeDestination();
        var protocolFee_before = await farkeys.degenWallet(protocolFeeDestination);

        //Get the balance of the owner 
        var owner_balance_before = await degen.balanceOf(protocolFeeDestination);

        //Withdraw the protocol fees
        var withdraw = await farkeys.connect(owner).withdrawProtocolFees();
        await expect(withdraw).to.emit(farkeys, 'Withdrawn').withArgs(protocolFeeDestination, protocolFee_before);

        //Get the balance of the owner 
        var owner_balance_after = await degen.balanceOf(protocolFeeDestination);

        var bn_owner_balance_after = new BN(owner_balance_after);
        var bn_owner_balance_before = new BN(owner_balance_before);
        var bn_protocolFee_before = new BN(protocolFee_before);

        var decStrBN = new BN("1000000000000000000");

        //bn_owner_balance_after = bn_owner_balance_after.div(decStrBN);
        //bn_owner_balance_before = bn_owner_balance_before.div(decStrBN);
        //bn_protocolFee_before = bn_protocolFee_before.div(decStrBN);

        //console.log("Owner Balance :: ", bn_owner_balance_before.toString(), bn_owner_balance_after.toString(), bn_protocolFee_before.toString());

        //Make sure the protocol fee is added up
        await expect(bn_owner_balance_after).to.be.equal(bn_owner_balance_before.add(bn_protocolFee_before));

        //await expect(owner_balance_after).to.be.equal(owner_balance_before + protocolFee_before);

        //Get the protocol fee destination address 
        var protocolFee_after = await farkeys.degenWallet(protocolFeeDestination);
        await expect(protocolFee_after).to.be.equal(0);
    });

    it("Withdrawal of FID shares", async function() {
        var fid_new = 434; 
        var fees_gathered = '56200000000000000000'

        var buy_price = await farkeys.connect(owner).getPrice(1,10);
        //Fees calculator 
        var __fees = await farkeys.connect(owner).fees();
        __fees = new BN(__fees);
        var bn_buy_price = new BN(buy_price);
        var _fees_ = bn_buy_price.mul(__fees).div(new BN(10000)).toString();


        //Get the address of an FID
        var _Address = await fidaddress.custodyOf(fid_new);
        await expect(_Address).to.equal(diffAccounts[17].address);

        //Get the balance of address 17
        var user_17_wallet_balance = await degen.balanceOf(diffAccounts[17].address)
        await expect(user_17_wallet_balance).to.equal(0);

        //Get the inventory balance of the fid 
        var user_17_inventory_balance = await farkeys.subjectFees(fid_new)
        await expect(user_17_inventory_balance).to.equal(_fees_);

        //Withraw the subject fees
        var withdraw = farkeys.connect(diffAccounts[17]).withdrawSubjectFees(fid_new);
        await expect(withdraw).to.emit(farkeys, 'Withdrawn').withArgs(diffAccounts[17].address, _fees_);

        //Get the balance of address 17
        var user_17_wallet_balance_after = await degen.balanceOf(diffAccounts[17].address)
        await expect(user_17_wallet_balance_after).to.equal(_fees_);


        //Get the balance of the contract inventory
        var user_17_inventory_balance_after = await farkeys.subjectFees(fid_new)
        await expect(user_17_inventory_balance_after).to.equal(0);



    });

    it("First key withdrawal", async function() {
        var fid_new = 4345; 

        //Whitelist a new fid
        await farkeys.connect(owner).whitelistFids([fid_new]);

        //let use 1 buy 5 keys of the new fid
        var keys = 5;
        var buy_price = await farkeys.connect(addr1).buyCards(fid_new, keys);


        //Get the address of the fid 
        var _Address = await fidaddress.custodyOf(fid_new);
        await expect(_Address).to.equal("0x0000000000000000000000000000000000000000");

        //Add fid to the address 17 
        const address_17_fid_new = await fidaddress.addFid(fid_new, diffAccounts[17].address);

        //Get the address of the fid
        var _Address = await fidaddress.custodyOf(fid_new);
        await expect(_Address).to.equal(diffAccounts[17].address);

        //Get the keys balance of the contract 
        var balance_contract = await farkeys.balanceOf(farkeys.target, fid_new);
        await expect(balance_contract).to.equal(1);
        
        //Get the keys balance of the user 17
        var balance_user = await farkeys.balanceOf(diffAccounts[17].address, fid_new);
        await expect(balance_user).to.equal(0);

        //withdraw the first key
        var withdraw = farkeys.connect(diffAccounts[17]).withdrawFirstKey(fid_new);
        await expect(withdraw).to.emit(farkeys, 'FidKeyWithdrawn').withArgs(fid_new, diffAccounts[17].address);

        //Get the keys balance of the contract
        var balance_contract = await farkeys.balanceOf(farkeys.target, fid_new);
        await expect(balance_contract).to.equal(0);

        //Get the keys balance of the user 17
        var balance_user = await farkeys.balanceOf(diffAccounts[17].address, fid_new);
        await expect(balance_user).to.equal(1);
        



    });


    it("Do we need options buy using ETH", async function() {
        console.error("@todo");
    });

});


describe("Sell the keys", async function() {
    it("Fix for 0 amount sell hack", async function() {
        var fid = 1;
        var balance = await farkeys.totalSupply( fid);
        //console.log("Balance :: ", balance.toString());
        //Get the balance of the user 17
        var balance_user = await farkeys.balanceOf(diffAccounts[17].address, fid);
        //console.log("Balance User :: ", balance_user.toString());

        //Sell the cards 
        var sell =  farkeys.connect(diffAccounts[17]).sellCards(fid, 0);
        await expect(sell).to.be.revertedWith("Invalid amount");

        //Try sell the bulk cards 
        var sell =  farkeys.connect(diffAccounts[17]).sellCardsBulk([fid], [0]);
        await expect(sell).to.be.revertedWith("Insufficient Cards");
    });

    it("Try buy 0 amount", async function() {
        //buy 0 amount of cards
        var fid_new = 434; 

        var try0buy = farkeys.connect(diffAccounts[13]).buyCards(fid_new, 0);
        await expect(try0buy).to.be.revertedWith("Invalid amount");


        var try0buyBulk = farkeys.connect(diffAccounts[13]).buyCardsBulk([fid_new], [0]);
        await expect(try0buyBulk).to.be.revertedWith("Invalid amount");

    });

    it("FID address stuffs", async function() {

        //Get the address from FID 
        var fid_new = 43412;
        var _Address = await fidaddress.custodyOf(fid_new);
        console.log("Address :: ", _Address);
    });

});


describe("Price Testing", async function() {

    async function _getFees(_price) {
        var _fees = await farkeys.connect(owner).fees();
        _fees = new BN(_fees);
        var bn_buy_price = new BN(_price);
        var _fees_ = bn_buy_price.mul(_fees).div(new BN(10000));
        return _fees_;
    }

    async function _getAddress(fid, iteration = 0) {
        var _Address = await fidaddress.custodyOf(fid);
        _Address = _Address.toString();
        _Address = _Address.toLowerCase();

        var _zeroADdress = "0x0000000000000000000000000000000000000000"
        if(_Address == _zeroADdress) {
            if(iteration == 0) {
                return farkeys.target;
            }
            return _zeroADdress;
        }

        return _Address;
    }

    function cutZeros(str, rep = '000000000000000000') {
        return str.replace(rep, '');
    }

    function cum_nth_price(n, items = 1) {
        //n = n || 1;
        var _price = 0;
        for(let i = 1; i <= items; i++) {
            _price += nth_price(n + i);
        }
        return _price;
    }

    function cum_nth_price_reverse(n, items = 1) {
        //n = n || 1;
        var _price = 0;
        for(let i = 1; i <= items; i++) {
            _price += nth_price(n - i);
        }
        return _price;
    }

    function bn_to_float(str, digits = "1000000000000000000") {
        var _price = new BN(str);
        _price = _price.div(new BN(digits));
        var _float = _price.toString();
        return parseFloat(_float);
    }

    async function get_degen_balance(address, formated = true) {
        var _balance = await degen.balanceOf(address);
        if(formated) {
            _balance = bn_to_float(_balance);
        }
        return _balance;
    }

    it("Buy a single card, one by one and check the price", async function() {
        //Make it permissionless    
        await farkeys.connect(owner).setPermissionless();

        var fid_for_testing = 43432;
        var _times = 10;
        var _price = 0;

        var cards = 3;
        var bn_cards = new BN(cards);
        var current_supply = 0;

        var total_cost = 0;

        //Get the balance of the user 13
        var user_13_wallet_balance_before = await degen.balanceOf(diffAccounts[13].address)

        var output_buy = [];   
        console.log()
        console.log()         
        console.log("Buying....")
        //All the buying stuffs 
        for(let i = 1; i <= _times; i++) {
        //buy keys one after one for n times 

            var user_before_buy = await get_degen_balance(diffAccounts[13].address, true);
            var contract_before_buy = await get_degen_balance(farkeys.target, true);


            var bought = await farkeys.connect(diffAccounts[13]).buyCards(fid_for_testing, cards);
            _price = cum_nth_price(current_supply, cards);


            _price = new BN(_price);
            _price = _price.mul(new BN("1000000000000000000"));//.mul(bn_cards);

            var _fees_ = await _getFees(_price);
            //_fees_ = _fees_.mul(bn_cards);

            var _fidAddress = await _getAddress(fid_for_testing, i-1);



            await expect(bought).to.emit(farkeys, 'Trade')
                .withArgs(diffAccounts[13].address, _fidAddress, true, fid_for_testing, cards, _price.toString(), _fees_.toString(), (i * cards) + 1);
        
            
            var float_price = parseInt(cutZeros(_price.toString(), "000000000000000000"))
            var float_fee = parseInt(cutZeros(_fees_.toString(), "00000000000000")) / 10000;

            var user_after_buy = await get_degen_balance(diffAccounts[13].address, true);
            var contract_after_buy = await get_degen_balance(farkeys.target, true);

            //

            var to_pay = (float_price + (float_fee * 2));
            var _to_pay = parseInt(parseFloat(to_pay).toFixed(0));

            var _user_balance_before_temp = user_before_buy - _to_pay;
            var _user_balance_before_arr = [_user_balance_before_temp -1, _user_balance_before_temp, _user_balance_before_temp + 1]

            var _contract_balance_before_temp = contract_before_buy + _to_pay;
            var _contract_balance_before_arr = [_contract_balance_before_temp -1, _contract_balance_before_temp, _contract_balance_before_temp + 1]

            //Check the user balance after and before 
            //await expect(user_after_buy).to.be.equal(user_before_buy - _to_pay);

            await expect(user_after_buy).to.be.oneOf(_user_balance_before_arr);
            await expect(contract_after_buy).to.be.oneOf(_contract_balance_before_arr);

            //console.log("Price :: ", i, float_price , float_fee ,to_pay, _to_pay, user_before_buy, user_after_buy, contract_before_buy, contract_after_buy);

            
            total_cost += (float_price + (float_fee * 2));

            current_supply += cards;

            //await emit('Trade', bought);
            //console.log("Bought :: ", whatsup);
            var _row = {
                "cards_buy": cards,
                "existing_cards": current_supply - cards,
                "price": float_price,
                "fees": float_fee * 2,
                "to_pay": _to_pay,
                "trader_paid": user_before_buy - user_after_buy,
                "contract_received": contract_after_buy - contract_before_buy,
                //"contract_after": ,
            
            }
            output_buy.push(_row);
        }
        console.table(output_buy);

        console.log()
        console.log()

        var user_13_wallet_balance_after = await degen.balanceOf(diffAccounts[13].address)
        var bn_user_13_wallet_balance_after = new BN(user_13_wallet_balance_after);
        var bn_user_13_wallet_balance_before = new BN(user_13_wallet_balance_before);

        bn_user_13_wallet_balance_after = bn_user_13_wallet_balance_after.div(new BN("1000000000000000000"));
        bn_user_13_wallet_balance_before = bn_user_13_wallet_balance_before.div(new BN("1000000000000000000"));

        console.log();
        console.log();


        //cards = 2
        //_times =  _times  - 1 
        
        //Sales stuff 
        var first_sale = 1100;
        //console.log("ID :: PRICE :: FEES :: TO PAY :: USER SPEND :: CONTRACT SPEND");
        var output_sell = [];    

        console.log("Selling....")

        var break_point = _times - 1;

        for(let i = 1; i <= _times; i++) {

            var user_before_sell = await get_degen_balance(diffAccounts[13].address, true);
            var contract_before_sell = await get_degen_balance(farkeys.target, true);



            var sold = await farkeys.connect(diffAccounts[13]).sellCards(fid_for_testing, cards);

            var user_after_sell = await get_degen_balance(diffAccounts[13].address, true);
            var contract_after_sell = await get_degen_balance(farkeys.target, true);


            _price = cum_nth_price_reverse(current_supply + 1, cards);
            _price = new BN(_price);
            _price = _price.mul(new BN("1000000000000000000"));//.mul(bn_cards);

            var _fees_ = await _getFees(_price);

            var float_price = parseInt(cutZeros(_price.toString(), "000000000000000000"))
            var float_fee = parseInt(cutZeros(_fees_.toString(), "00000000000000")) / 10000;

            var to_pay = (float_price - (float_fee * 2));
            var _to_pay = parseInt(parseFloat(to_pay).toFixed(0));


            //console.log("Selling Price :: ", i, float_price, float_fee, _to_pay, (user_after_sell - user_before_sell), (contract_before_sell - contract_after_sell));


            await expect(sold).to.emit(farkeys, 'Trade')
                .withArgs(diffAccounts[13].address, _fidAddress, false, fid_for_testing, cards, _price.toString(), _fees_.toString(), ((_times - i) * cards) + 1);

            //For user 
            var _user_balance_before_temp = user_before_sell + _to_pay;
            var _user_balance_before_arr = [_user_balance_before_temp -1, _user_balance_before_temp, _user_balance_before_temp + 1]
            await expect(user_after_sell).to.be.oneOf(_user_balance_before_arr);

            //For contract 
            var _contract_balance_before_temp = contract_before_sell - _to_pay;
            var _contract_balance_before_arr = [_contract_balance_before_temp -1, _contract_balance_before_temp, _contract_balance_before_temp + 1]
            await expect(contract_after_sell).to.be.oneOf(_contract_balance_before_arr);

            //await expect(user_after_sell).to.be.equal(user_before_sell + _to_pay);

            current_supply -= cards;

            var _row = {
                "cards_sell": cards,
                "existing_cards": current_supply + cards,
                "price": float_price,
                "fees": float_fee * 2,
                "to_receive": _to_pay,
                "trader_received": user_after_sell - user_before_sell,
                "contract_paid": contract_before_sell - contract_after_sell,
                //"trader_paid": user_before_buy - user_after_buy,
                //"contract_received": contract_after_buy - contract_before_buy,
                //"contract_after": ,
            
            }
            output_sell.push(_row);    
            
            if(break_point == i) {
                break;
            }
        }

        var sold = await farkeys.connect(diffAccounts[13]).sellCards(fid_for_testing, 3);

        console.table(output_sell);

        console.log()
        console.log()        
        console.log()
        console.log()

        console.log("Total Cost Buying :: ", total_cost, bn_user_13_wallet_balance_after.toString(), bn_user_13_wallet_balance_before.toString());

        console.log("Buy a single card, one by one and check the price,, sell it one by one and check the price");

    });


});

describe("FFTTSS1 Stuffs", async function() {
    var fids = [
        2, 3, 4, 5, 6, 7, 8, 9, 10, 11
    ]

    var freeDecks = 10

    it("Admin settings stuff", async function() {
        //Check if the free decks are set and right 
        var _freedecks = await ffttss1.connect(owner).FreeDecks();
        await expect(_freedecks).to.be.equal(freeDecks);

        var newFreeDecks = 1;
        //Change the free decks
        var setFreeDecks = await ffttss1.connect(owner).setFreeDecks(newFreeDecks);
        var _freedecks = await ffttss1.connect(owner).FreeDecks();
        await expect(_freedecks).to.be.equal(newFreeDecks);

        var setFreeDecks = ffttss1.connect(addr1).setFreeDecks(2);        
        await expect(setFreeDecks).to.be.reverted;

        //Get the owner of the contract
        var _owner = await ffttss1.owner();
        await expect(_owner).to.be.equal(owner.address);

        //Transfer some ourcoins to addr1 
        var _value = "100000000000000000000000000";
        var transfer = await ourcoin.connect(owner).transfer(ffttss1.target, _value);
        var balance = await ourcoin.balanceOf(ffttss1.target);
        await expect(balance).to.be.equal(_value);

        //Non admin trying to withdraw that ERC20 token
        var withdraw = ffttss1.connect(addr1).withdrawERC20(ourcoin.target, _value);
        await expect(withdraw).to.be.reverted;

        var balanceCheck = await ourcoin.balanceOf(ffttss1.target);
        await expect(balanceCheck).to.be.equal(_value);

        //Admin trying to withdraw that ERC20 token
        var withdraw = await ffttss1.connect(owner).withdrawERC20(ourcoin.target, _value);
        //await expect(withdraw).to.emit(ffttss1, 'Withdrawn').withArgs(ourcoin.target, _value);

        var balanceCheck = await ourcoin.balanceOf(ffttss1.target);
        await expect(balanceCheck).to.be.equal(0);



    });

    it("Card Transfers", async function() {  

        var cards = [2,3,4];
        var qtys = [2,2,2];


        var transfer = ffttss1.connect(addr1).transferCardsIn(cards, qtys);
        await expect(transfer).to.be.reverted;
        //await expect(transfer).to.be.revertedWith("Ownable: caller is not the owner");

        //Approve the cards to the game
        var approve = await farkeys.connect(addr1).setApprovalForAll(ffttss1.target, true);


        var accounts = [addr1.address, addr1.address, addr1.address];
        var bulkBalance_before = await farkeys.balanceOfBatch(accounts, cards);
        //console.log("Bulk Balance Before :: ", bulkBalance_before);

        var _game_addresses = [ffttss1.target, ffttss1.target, ffttss1.target];
        var bulkBalance_before_game = await farkeys.balanceOfBatch(_game_addresses, cards);
        //console.log("Bulk Balance Before Game :: ", bulkBalance_before_game);
        
        
        //Transfer the cards to the game
        var transfer = ffttss1.connect(addr1).transferCardsIn(cards, qtys);
        await expect(transfer).to.emit(ffttss1, 'CardsTransfered').withArgs(addr1.address, 0, true, cards, qtys);

        var bulkBalance_after = await farkeys.balanceOfBatch(accounts, cards);
        //console.log("Bulk Balance After :: ", bulkBalance_after);

        var bulkBalance_after_game = await farkeys.balanceOfBatch(_game_addresses, cards);
        //console.log("Bulk Balance After Game :: ", bulkBalance_after_game);

        for(let _index in  bulkBalance_before) {
            await expect(bulkBalance_after[_index] + bulkBalance_after_game[_index]).to.be.equal(bulkBalance_before[_index] + bulkBalance_before_game[_index]);
        }

        //Check the inventory in the game 
        for(let card of cards) {
            var inventory = await ffttss1.cardsBalances(addr1.address, card);
            await expect(inventory).to.be.equal(2);
            var wrong   = await ffttss1.cardsBalances(addr2.address, card);
            await expect(wrong).to.be.equal(0);
        }
    });

    it("Card Transfers Out", async function() { 
        //when a different user trying to withdraw the cards 
        var cards = [2,3,4];
        var qtys = [2,2,2];
        var transfer = ffttss1.connect(addr2).transferCardsOut(cards, qtys);
        await expect(transfer).to.be.revertedWith("Transfer Out Disabled");

        //For now activate the transfer out 
        await ffttss1.connect(owner).setTransferOut(true);
        var transfer = ffttss1.connect(addr2).transferCardsOut(cards, qtys);
        await expect(transfer).to.be.revertedWith("Not enough Cards");

        //Real owner trying to transfer more than he has
        var transfer = ffttss1.connect(addr1).transferCardsOut(cards, [4,5,6]);
        await expect(transfer).to.be.revertedWith("Not enough Cards");

        //Re enable the transfer out
        //await ffttss1.connect(owner).setTransferOut(true);

        //Get the balance of cards before transfer for addr1 and for the game
        var accounts = [addr1.address, addr1.address, addr1.address];
        var bulkBalance_before = await farkeys.balanceOfBatch(accounts, cards);
        //console.log("Bulk Balance Before :: ", bulkBalance_before);

        var _game_addresses = [ffttss1.target, ffttss1.target, ffttss1.target];
        var bulkBalance_before_game = await farkeys.balanceOfBatch(_game_addresses, cards);
        //console.log("Bulk Balance Before Game :: ", bulkBalance_before_game);


        var transfer = ffttss1.connect(addr1).transferCardsOut(cards, qtys);
        await expect(transfer).to.emit(ffttss1, 'CardsTransfered').withArgs(addr1.address, 0, false, cards, qtys);

        var bulkBalance_after = await farkeys.balanceOfBatch(accounts, cards);
        //console.log("Bulk Balance After :: ", bulkBalance_after);

        var bulkBalance_after_game = await farkeys.balanceOfBatch(_game_addresses, cards);
        //console.log("Bulk Balance After Game :: ", bulkBalance_after_game);

        for(let _index in  bulkBalance_before) {
            await expect(bulkBalance_after[_index] + bulkBalance_after_game[_index]).to.be.equal(bulkBalance_before[_index] + bulkBalance_before_game[_index]);
        }
    });

    it("Card Partial Transfers", async function() { 
        var cards = [2,3,4];
        var qtys = [3,3,3];
        var transfer = ffttss1.connect(addr1).transferCardsIn(cards, qtys);
        await expect(transfer).to.emit(ffttss1, 'CardsTransfered').withArgs(addr1.address, 0, true, cards, qtys);

        var qtys_partial = [1,1,1]
        var transfer = ffttss1.connect(addr1).transferCardsOut(cards, qtys_partial);
        await expect(transfer).to.emit(ffttss1, 'CardsTransfered').withArgs(addr1.address, 0, false, cards, qtys_partial);

        var bulkBalance = await farkeys.balanceOfBatch([ffttss1.target, ffttss1.target, ffttss1.target], cards);
        //console.log("Bulk Balance :: ", bulkBalance);
        for(let _index in  cards) {
            var card_id = cards[_index];
            var inventory = await ffttss1.cardsBalances(addr1.address, card_id);
            await expect(inventory).to.be.equal(2);
        }


        var transfer = ffttss1.connect(addr1).transferCardsOut(cards, qtys_partial);
        await expect(transfer).to.emit(ffttss1, 'CardsTransfered').withArgs(addr1.address, 0, false, cards, qtys_partial);
        for(let _index in  cards) {
            var card_id = cards[_index];
            var inventory = await ffttss1.cardsBalances(addr1.address, card_id);
            await expect(inventory).to.be.equal(1);
        }


    })

    it("Price Testing", async function() {

        var _counter = [1,2,3,4,5,6];
        for(let i of _counter) {
            var finalPrice = ffttss_price(2, i);    
            //console.log("Final Price :: ", i, finalPrice.toString());
        }
        
    });

    it("Deck Create Negative", async function() {
        //try create a deck with 0 cards
        var cards = [2,3,4,5];

        for(let i of cards) {
            var partil_cards = cards.slice(0, i);
            var txn = ffttss1.connect(addr1).deckCreate(partil_cards);
            await expect(txn).to.be.revertedWith("Invalid count");
        }

        //try create a deck with duplicate cards
        var duplicate_cards = [2,2,3,4];
        var txn = ffttss1.connect(addr1).deckCreate(duplicate_cards);
        await expect(txn).to.be.revertedWith("Duplicate cards");

        //try with too many cards 
        var too_many_cards = [2,3,4,5,6,7,8,9,10,11];
        var txn = ffttss1.connect(addr1).deckCreate(too_many_cards);
        await expect(txn).to.be.revertedWith("Invalid count");

        //try with too many cards but duplicates 
        var too_many_cards = [2,3,4,5,6, 2,3,4,5,6];
        var txn = ffttss1.connect(addr1).deckCreate(too_many_cards);
        await expect(txn).to.be.revertedWith("Duplicate cards");

        //try with cards that do not exists  
        var too_many_cards = [1112,1113,1114,1115,1116]
        var txn = ffttss1.connect(addr1).deckCreate(too_many_cards);
        await expect(txn).to.be.reverted;
        


    });


    it("Deck Create Positive", async function() {
        //Lets create a deck 
        var deckName = "test"

        var degen_allow = await degen.balanceOf(addr1.address);

        var approve = await degen.connect(addr1).approve(ffttss1.target, degen_allow.toString());

        var FreeDecks = await ffttss1.FreeDecks();

        console.log("Free Decks :: ", FreeDecks);


        var cards = [2,3,4,5,6];

        var cardBalanceInventory = {}
        var cardBalanceInventoryUsage = {}
        var cardBalanceInventorywallet = {}

        for(let card of cards) {
            var inventory = await ffttss1.cardsBalances(addr1.address, card);
            cardBalanceInventory[card] = inventory;
            cardBalanceInventoryUsage[card] = 0;

            var walletBalance = await farkeys.balanceOf(addr1.address, card);
            cardBalanceInventorywallet[card] = walletBalance;
        }

        //console.log("Card Balance Inventory :: ", cardBalanceInventory);

        //@tood 
        //check if balance, usage, card data all matching correctly 

        var _counter = [1,2,3,4,5,6];
        var iteration = 0;
        for(let i of _counter) {
            //Current deck ID stuffs
            var deckID = await ffttss1.connect(addr1).DeckID();
            await expect(deckID).to.be.equal(i - 1);

            var fees2pay = ffttss_price(FreeDecks.toString(), i-1);    

            var degen_balance_before = await degen.balanceOf(addr1.address);
            var degen_balance_before_game = await degen.balanceOf(ffttss1.target);

            //console.log("Deck ID :: ", i, deckID.toString(), fees2pay.toString());
            const timestamp = await time.latest();

            var txn = ffttss1.connect(addr1).deckCreate(cards);
            //get current timestamp 
            //var timestamp = Math.floor(Date.now() / 1000);
            await expect(txn).to.emit(ffttss1, 'DeckCreated').withArgs(addr1.address, i, fees2pay + "000000000000000000", timestamp + 1, cards);

            var degen_balance_after = await degen.balanceOf(addr1.address);
            var degen_balance_after_game = await degen.balanceOf(ffttss1.target);

            var _fees2pay = new BN(fees2pay);
            var _degen_balance_before = new BN(degen_balance_before);
            var _degen_balance_after = new BN(degen_balance_after);

            var _degen_balance_before_game = new BN(degen_balance_before_game);
            var _degen_balance_after_game = new BN(degen_balance_after_game);

            var _degen_balance_before = _degen_balance_before.div(new BN("1000000000000000000"));
            var _degen_balance_after = _degen_balance_after.div(new BN("1000000000000000000"));

            var _degen_balance_before_game = _degen_balance_before_game.div(new BN("1000000000000000000"));
            var _degen_balance_after_game = _degen_balance_after_game.div(new BN("1000000000000000000"));

            _degen_balance_before = parseInt(_degen_balance_before.toString());
            _degen_balance_after = parseInt(_degen_balance_after.toString());

            _degen_balance_before_game = parseInt(_degen_balance_before_game.toString());
            _degen_balance_after_game = parseInt(_degen_balance_after_game.toString());

            await expect(_degen_balance_before + _degen_balance_before_game).to.be.equal(_degen_balance_after + _degen_balance_after_game);
            //await expect(_degen_balance_after_game).to.be.equal(_degen_balance_before_game + _fees2pay);


            //Card balances testing 
            for(let card of cards) {
                var inventory = await ffttss1.cardsBalances(addr1.address, card);
                var walletBalance = await farkeys.balanceOf(addr1.address, card);
                var usage = await ffttss1.cardsUsage(addr1.address, card);
                //console.log("Card :: ", card, iteration, walletBalance, inventory,  cardBalanceInventory[card], usage);
                //console.log("Card :: ", card, iteration, inventory,  cardBalanceInventory[card], usage);
                await expect(usage).to.be.equal(iteration + 1);

                //console.log("Card :: ", card, iteration, cardBalanceInventorywallet[card], cardBalanceInventory[card], inventory,  walletBalance,  usage);

                await expect(parseInt(cardBalanceInventorywallet[card]) + parseInt(cardBalanceInventory[card])).to.be.equal(parseInt(walletBalance) + parseInt(usage));
            }

            iteration++;
        }

        var lastDeckID = await ffttss1.connect(addr1).DeckID();
        for(let i = 0; i < 5; i++) {
            var deckCard = await ffttss1.deckCards(lastDeckID, i);
            await expect(deckCard).to.be.equal(cards[i]);
            //console.log("Deck Cards :: ", i, deckCard);
        }


    });

    it("Deck Edits Negative", async function() {
        //Different user should not edit the deck   
        var new_deck_items = [7,8,9,10,11];
        var lastDeckID = await ffttss1.connect(addr1).DeckID();        
        var txn =   ffttss1.connect(addr2).deckEdit(lastDeckID, new_deck_items);
        await expect(txn).to.be.revertedWith("Not your deck");

        //Should not able to edit with 0 cards
        
        var txn = ffttss1.connect(addr1).deckEdit(lastDeckID, []);
        await expect(txn).to.be.revertedWith("Invalid Count");

        //Should not able to edit with duplicate cards
        var txn = ffttss1.connect(addr1).deckEdit(lastDeckID, [2,2,3,4,5]);
        await expect(txn).to.be.revertedWith("Duplicate cards");

        //Try with too many cards
        var txn = ffttss1.connect(addr1).deckEdit(lastDeckID, [2,3,4,5,6,7,8,9,10,11]);
        await expect(txn).to.be.revertedWith("Invalid Count");

        //check what if we can edit withsame cards 
        //var txn = await ffttss1.connect(addr1).deckEdit(lastDeckID, [2,3,4,5,6]);
        var too_many_cards = [1112,1113,1114,1115,1116]
        var txn = ffttss1.connect(addr1).deckCreate(too_many_cards);
        await expect(txn).to.be.reverted;
    });

    it("Deck Edits ", async function() {
        //Test how the inventorys are not affecting while editing the deck 
        var fids = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

        var lastDeckID = await ffttss1.connect(addr1).DeckID();

        var deckView = await ffttss1.deckView(lastDeckID);

        
        var lastDeckItems = deckView
        
        var new_deck_items = [7,8,9,10,11];
        var old_deck_items = deckView
        
        var timestamp = await time.latest();


        //Get the wallet balance and card useage of new deck items 
        var newCardUsageBefore = {};
        var newCardWalletBefore = {};

        for(let card of new_deck_items) {
            var usage = await ffttss1.cardsUsage(addr1.address, card);
            var wallet = await farkeys.balanceOf(addr1.address, card);
            newCardUsageBefore[card] = usage;
            newCardWalletBefore[card] = wallet;
        }

        //console.log("New Card Usage Before :: ", newCardUsageBefore);
        //console.log("New Card Wallet Before :: ", newCardWalletBefore);

        //check the balance in usage, in inventory and in wallet 

        var cardUsageBefore = {

        };
        var cardInventoryBefore = {};
        var cardWalletBefore = {};

        for(let card of deckView) {
            var usage = await ffttss1.cardsUsage(addr1.address, card);
            var inventory = await ffttss1.cardsBalances(addr1.address, card);
            var wallet = await farkeys.balanceOf(addr1.address, card);

            cardUsageBefore[card] = usage;
            cardInventoryBefore[card] = inventory;
            cardWalletBefore[card] = wallet;
        }

        var txn =  ffttss1.connect(addr1).deckEdit(lastDeckID, new_deck_items);
        await expect(txn).to.emit(ffttss1, 'DeckEdited').withArgs(addr1.address, lastDeckID, timestamp+ 1, new_deck_items);

        var cardUsageAfter = {};
        var cardInventoryAfter = {};
        var cardWalletAfter = {};

        for(let card of deckView) {
            var usage = await ffttss1.cardsUsage(addr1.address, card);
            var inventory = await ffttss1.cardsBalances(addr1.address, card);
            var wallet = await farkeys.balanceOf(addr1.address, card);

            cardUsageAfter[card] = usage;
            cardInventoryAfter[card] = inventory;
            cardWalletAfter[card] = wallet;
        }        

        for(let card of deckView) {
            await expect(cardUsageBefore[card] + cardInventoryBefore[card]).to.be.equal(cardUsageAfter[card] + cardInventoryAfter[card]);
            //await expect(cardInventoryBefore[card]).to.be.equal(cardInventoryAfter[card]);
            //await expect(cardWalletBefore[card]).to.be.equal(cardWalletAfter[card]);

        }


        //Check the wallet balance and card useage of new deck items
        var newCardUsageAfter = {};
        var newCardWalletAfter = {};

        for(let card of new_deck_items) {
            var usage = await ffttss1.cardsUsage(addr1.address, card);
            var wallet = await farkeys.balanceOf(addr1.address, card);
            newCardUsageAfter[card] = usage;
            newCardWalletAfter[card] = wallet;
        }

        //console.log("New Card Usage After :: ", newCardUsageAfter);
        //console.log("New Card Wallet After :: ", newCardWalletAfter);

        for(let card of new_deck_items) {
            await expect(newCardUsageBefore[card] + newCardWalletBefore[card]).to.be.equal(newCardUsageAfter[card] + newCardWalletAfter[card]);
            //await expect(newCardUsageBefore[card]).to.be.equal(newCardUsageAfter[card]);
            //await expect(newCardWalletBefore[card]).to.be.equal(newCardWalletAfter[card]);
        }

        //var timestamp = await time.latest();
        //var txn =  ffttss1.connect(addr1).deckEdit(lastDeckID, old_deck_items);
        //await expect(txn).to.emit(ffttss1, 'DeckEdited').withArgs(addr1.address, lastDeckID, timestamp+ 1, old_deck_items);

        //var timestamp = await time.latest();
        //var txn =  ffttss1.connect(addr1).deckEdit(lastDeckID, new_deck_items);
        //await expect(txn).to.emit(ffttss1, 'DeckEdited').withArgs(addr1.address, lastDeckID, timestamp+ 1, new_deck_items);

    });

    it("Deck Delete Stuffs", async function() {
        //Different user should not remove the deck   
        var lastDeckID = await ffttss1.connect(addr1).DeckID();        
        var txn =   ffttss1.connect(addr2).deckDelete(lastDeckID);
        await expect(txn).to.be.revertedWith("Not your deck");

        //Check if the deck is already removed 
        //var txn = ffttss1.connect(addr1).deckRemove(lastDeckID);
        //await expect(txn).to.be.revertedWith("Deck already removed");

        var deck_to_delete = 4
        var timestamp = await time.latest();

        //get the deck items
        var deckView = await ffttss1.deckView(deck_to_delete);

        //get the card usage and wallet balance of the deck items
        var cardUsageBefore = {};
        var cardInventoryBefore = {};
        var cardWalletBefore = {};

        for(let card of deckView) {
            var usage = await ffttss1.cardsUsage(addr1.address, card);
            var inventory = await ffttss1.cardsBalances(addr1.address, card);
            var wallet = await farkeys.balanceOf(addr1.address, card);

            cardUsageBefore[card] = usage;
            cardInventoryBefore[card] = inventory;
            cardWalletBefore[card] = wallet;
        }


        var txn =   ffttss1.connect(addr1).deckDelete(deck_to_delete);
        await expect(txn).to.emit(ffttss1, 'DeckDeleted').withArgs(addr1.address, deck_to_delete, timestamp + 1);

        //Get the card usage and wallet balance of the deck items
        var cardUsageAfter = {};
        var cardInventoryAfter = {};
        var cardWalletAfter = {};

        for(let card of deckView) {
            var usage = await ffttss1.cardsUsage(addr1.address, card);
            var inventory = await ffttss1.cardsBalances(addr1.address, card);
            var wallet = await farkeys.balanceOf(addr1.address, card);

            cardUsageAfter[card] = usage;
            cardInventoryAfter[card] = inventory;
            cardWalletAfter[card] = wallet;
        }

        //Check the balance in usage, in inventory and in wallet
        for(let card of deckView) {
            await expect(cardUsageBefore[card] + cardInventoryBefore[card]).to.be.equal(cardUsageAfter[card] + cardInventoryAfter[card]);
            //await expect(cardInventoryBefore[card]).to.be.equal(cardInventoryAfter[card]);
            //await expect(cardWalletBefore[card]).to.be.equal(cardWalletAfter[card]);

        }


        var deckView = await ffttss1.deckView(deck_to_delete);


        var txn =   ffttss1.connect(addr1).deckDelete(deck_to_delete);
        await expect(txn).to.be.revertedWith("Not your deck");

    })


    

    it("ETH Withdrawals", async function() {
        //Send some ETH to the contract
        var _value = "10000000000000000000";
        var send = await owner.sendTransaction({to: ffttss1.target, value: _value});

        //Get the eth balance of the contract
        var balance = await ethers.provider.getBalance(ffttss1.target);
        await expect(balance).to.be.equal(_value);

        //Non admin trying to withdraw the ETH
        var withdraw = ffttss1.connect(addr1).withdrawETH();
        await expect(withdraw).to.be.reverted;

        //Admin trying to withdraw the ETH
        var withdraw = await ffttss1.connect(owner).withdrawETH();
        

        //Get the ETH balance of the contract
        var balance = await ethers.provider.getBalance(ffttss1.target);
        await expect(balance).to.be.equal(0);
        

    });



});
    


});