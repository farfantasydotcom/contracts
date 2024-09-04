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




  const decStr = "000000000000000000";
  const blnbln = "1000000000000000000";

  const protocolFeePercent = "10000000000000000" // protocolFeePercent subjectFeePercent
  const subjectFeePercent = "10000000000000000"

  const delay = ms => new Promise(res => setTimeout(res, ms));



  //Deploy the token 
  before(async function() {



      [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, ...addrs] = await ethers.getSigners(25);

      diffAccounts = await ethers.getSigners(25);



      Fidaddress = await ethers.getContractFactory("Fidaddress");

      Farkeys = await ethers.getContractFactory("Farkeys");

      ERC20 = await ethers.getContractFactory("ERC20");

      FarfantasyDeck3 = await ethers.getContractFactory("FarfantasyDeck3");

      fidaddress = await Fidaddress.deploy();
      farkeys = await Farkeys.deploy();

      degen = await ERC20.deploy("Degen Coin", "DEGEN", 18, 1000000000);
      ourcoin = await ERC20.deploy("Our Coin", "OUR", 18, 100000000000);


      farfantasyDeck3 = await FarfantasyDeck3.deploy(farkeys.target);


      console.log("FID Deployed at ::", fidaddress.target);
      console.log("farkeys Deployed at ::", farkeys.target);
      console.log("Degen Deployed at ::", degen.target);
      console.log("Our Coin Deployed at ::", ourcoin.target);
      console.log("FarfantasyDeck3 Deployed at ::", farfantasyDeck3.target);

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

  async function price(supply, amount){
    var sum1 = supply == 0 ? 0 : (supply - 1 )* (supply) * (2 * (supply - 1) + 1);
    var sum2 = supply == 0 && amount == 1 ? 0 : (supply - 1 + amount) * (supply + amount) * (2 * (supply - 1 + amount) + 1);
    var summation = sum2 - sum1;
    return summation;

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



  describe("Setup the Farkeys", async function() {
      it("Set the token and the price ", async function() {
          var ticket_price = 100;
          var trySetTicketPrice = farkeys.connect(addr2).setTicketPrice(degen.target, ticket_price);
          var restex = await expect(trySetTicketPrice).to.be.reverted;
          trySetTicketPrice = await farkeys.connect(owner).setTicketPrice(degen.target, ticket_price);

          var ticket_price_incontract = await farkeys.ticketPrice(degen.target);
          await expect(ticket_price_incontract).to.equal(ticket_price);
      });

      it("Keys should not buyable if there is no tickets paid.", async function() {

          var buy = farkeys.connect(addr2).buyKeys(1, 1, {
              value: ethers.parseEther("0.5")
          });
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

          //Pay the premium tickets
          var pay = farkeys.connect(addr1).buyPremium(degen.target, 50000);
          await expect(pay).to.emit(farkeys, 'ticketBought').withArgs(addr1.address, degen.target, 50000, 50000 / 100);

          var ticketsAvailable = await farkeys.connect(addr1).premiumTickets(addr1.address);
          await expect(ticketsAvailable.toString()).to.equal('500');



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
          const addr1FarkeysBalance = farkeys.connect(addr2).buyKeys(1, 1, {
              value: ethers.parseEther("0.5")
          });
          var restex = await expect(addr1FarkeysBalance).to.be.revertedWith("Not whitelisted");

          var fids = _.range(1, 30);
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

          //get the subject fees of given address 

          var ETH_balances = {};
          for (let adr in _balance_check_addresses) {

              let balance = await web3.eth.getBalance(_balance_check_addresses[adr]);
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
          let balance_before = await web3.eth.getBalance(addr2.address);

          var supply = await farkeys.connect(addr1).totalSupply(1);
          await expect(supply).to.equal(0);

          //Disable the premium tickets
          var remove = await farkeys.connect(owner).setPremium(false);
          
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


          const addr1FarkeysBalance = await farkeys.connect(addr2).buyKeys(1, 1, {
              value: ethers.parseEther("0.5")
          });



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

          var what = await expect(addr1FarkeysBalance).to.emit(farkeys, 'Trade')
              .withArgs(addr2.address, diffAccounts[0].address, true, 1, 1, price.toString(),
                  protocolEthAmount.toString());


          supply = await farkeys.connect(addr1).totalSupply(1);
          await expect(supply).to.equal(2);

          var keysupply = await farkeys.connect(addr2).balanceOf(addr1.address, 1)
          await expect(keysupply).to.equal(0);


          var keysupply_for_fid = await farkeys.connect(addr2).balanceOf(diffAccounts[0].address, 1)
          await expect(keysupply_for_fid).to.equal(1);

          let balance_after = await web3.eth.getBalance(addr2.address);


          //Check the before and after balance of fid owner, contract balance, protocol fee, subject fee and buyer fees 
          var _log_table = [];

          var subject_fees = await farkeys.subjectFees(diffAccounts[0].address);
          //ETH_balances[diffAccounts[0].address]['after'] = subject_fees.toString()


          for (let adr in ETH_balances) {

              try {
                  let balance = await web3.eth.getBalance(adr);
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

          const addr1FarkeysBalance2 = await farkeys.connect(addr2).buyKeys(1, 1, {
              value: ethers.parseEther("0.5")
          });

          var remove = await farkeys.connect(owner).setPremium(true);

      });

      it("Buy keys with Premium on", async function() {
        //Should not able to buy without tickets
        var buy = farkeys.connect(addr7).buyKeys(1, 1, {
            value: ethers.parseEther("0.5")
        });
        var restex = await expect(buy).to.be.revertedWith("Insufficient tickets");

        var _degens_tokens = "10000000";
        //Transfer the degen tokens to the buyer
        var send = await degen.connect(owner).transfer(addr7.address, _degens_tokens);
        //Approve it for the contract 
        var approve = await degen.connect(addr7).approve(farkeys.target, _degens_tokens);
        var allowance = await degen.allowance(addr7.address, farkeys.target);
        //Buy the tickets
        var pay = await farkeys.connect(addr7).buyPremium(degen.target, _degens_tokens);
        //check the number of tickets addr7 has
        var ticketsAvailable = await farkeys.connect(addr7).premiumTickets(addr7.address);
        await expect(ticketsAvailable.toString()).to.equal('100000');
        
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

          //Load enough degen tokens to buy the shares
          var send = await degen.connect(owner).transfer(addr2.address, "10000");
          var balance = await degen.balanceOf(addr2.address);
          await expect(balance).to.equal("10000");

          var approve = await degen.connect(addr2).approve(farkeys.target, "10000");
          var allowance = await degen.allowance(addr2.address, farkeys.target);
          await expect(allowance).to.equal("10000");

          //Buy the tickets
          var pay = await farkeys.connect(addr2).buyPremium(degen.target, 5000);
          var ticketsAvailable = await farkeys.connect(addr2).premiumTickets(addr2.address);
          
          


          var buybulk = farkeys.connect(addr2).buyKeysBulk(fids, amounts, {
              value: ethers.parseEther("0.5")
          });
          var what = await expect(buybulk).to.emit(farkeys, 'Trade')

          //var restex = await expect(buybulk).to.be.revertedWith("Insufficient tickets");
          var buybulk1 = farkeys.connect(addr1).buyKeysBulk(fids, amounts10, {
              value: ethers.parseEther("0.5")
          });
          var what1 = await expect(buybulk1).to.emit(farkeys, 'Trade')


      });

      it("Should able to sell", async function() {

          //Get the NFT balance of the address
          var keysupply_for_fid1 = await farkeys.connect(addr2).balanceOf(addr2.address, 1)

          var sellPrice = await farkeys.connect(addr1).getSellPrice(1, 1);

          //console.log("Sell Price :: ", sellPrice.toString(), web3.utils.fromWei(sellPrice.toString()));

          var sell = farkeys.connect(addr2).sellKeys(1, 1);

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
                  protocolEthAmount.toString());

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

          var fid = 10;
          //Buy a share
          var buy = await farkeys.connect(diffAccounts[10]).buyKeys(fid, 1, {
              value: ethers.parseEther("0.5")
          });
          var supply = await farkeys.connect(addr1).totalSupply(1);

          //Check the buy price after fees 
          var buy_price_after = await farkeys.connect(addr1).getBuyPriceAfterFee(fid, 300);
          //console.log("Buy Price After Fee :: ", buy_price_after.toString(), web3.utils.fromWei(buy_price_after.toString()));

          //Another use buys 1000 shares 
          var buy = await farkeys.connect(diffAccounts[11]).buyKeys(fid, 300, {
              value: ethers.parseEther("700.5")
          });

          //console.log("Supply :: ", supply.toString());

          //ETH balance of the first user 
          let balance_before = await web3.eth.getBalance(diffAccounts[10].address);

          //First user sells 1 shares
          var sell = await farkeys.connect(diffAccounts[10]).sellKeys(fid, 1);

          //ETH balance of the first user
          let balance_after = await web3.eth.getBalance(diffAccounts[10].address);

          //Check the balance of the first user
      });

      it("If not premium, should able to buy without tickets", async function() {
          
            var buybulk = farkeys.connect(addr3).buyKeysBulk([12, 13, 14], [1, 1, 1], {
                value: ethers.parseEther("0.5")
            });
            var restex = await expect(buybulk).to.be.revertedWith("Insufficient tickets");

            //Remove the premium tickets
            var remove = await farkeys.connect(owner).setPremium(false);
            var buybulk = farkeys.connect(addr3).buyKeysBulk([12, 13, 14], [1, 1, 1], {
              value: ethers.parseEther("0.5")
            });
            var what = await expect(buybulk).to.emit(farkeys, 'Trade')

      });

  });

  describe("Operations", async function() {
    var _balance = "10055000"

    it("Check the balance of degen", async function() {
        //var _balance = "10055000"
        var balance = await degen.balanceOf(farkeys.target);
        await expect(balance).to.equal(_balance);
    });

    it("Non Admin should not able to withdraw the ERC20", async function() {
      var withdraw =  farkeys.connect(addr2).withdrawERC20(degen.target, 100)
      await expect(withdraw).to.be.reverted;
      var balance = await degen.balanceOf(farkeys.target);
      await expect(balance).to.equal(_balance);
    });    
    it("Admin should able to withdraw the ERC20", async function() {
      var withdraw = await farkeys.connect(owner).withdrawERC20(degen.target, 1000)
      var balance = await degen.balanceOf(farkeys.target);
      await expect(balance).to.equal("10054000");
    });        

    it("Check the Keys balance of the contracts", async function() {
        //whitelist the fids 
        var fids = [300, 301, 302]
        await farkeys.connect(owner).whitelistFids(fids);

        var buybulk = await farkeys.connect(addr3).buyKeysBulk(fids, [1, 1, 1], {
          value: ethers.parseEther("0.5")
        });

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
            console.log("Supply :: ", items[i], supply.toString());
        }

        var mint2 = farfantasyDeck3.connect(addr8).mint2(items,{
            value: ethers.parseEther("0.005")
        });
        await expect(mint2).to.emit(farfantasyDeck3, 'Transfer');
        //await expect(mint2).to.be.revertedWith("Insufficient payment");

        console.log();
        console.log();

        var deckID = await farfantasyDeck3.deckID();
        var deck = await farfantasyDeck3.getDeckFids(deckID - 1n);

        var ownerOf = await farfantasyDeck3._ownerOf(deckID - 1n);
        
        await expect(addr8.address).to.be.deep.equal(ownerOf);



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

        var burn = await farfantasyDeck3.connect(addr8).burn(2, true);
        var owner_3 = await farfantasyDeck3.getDeckFids(2);

        for(let i = 0; i < items.length; i++) {
            var balance_buyer = await farkeys.balanceOf(addr8.address, items[i]);
            await expect(balance_buyer).to.be.equal(1);
        }



    });

    it("Price Calculatore", async function() {

        var supply = _.range(0, 1000);
        for(let item in supply) {
            var _p = await price(item,1);
            var price_sum_1 = price_sum1(item, 1);
            var price_sum_2 = price_sum2(item, 1);
            console.log("Supply :: ", item, price_sum_1, price_sum_2, _p.toString(), bondingFarkey(item, 1));
        }
        
    });
});







});