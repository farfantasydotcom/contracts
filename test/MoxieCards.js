//const { expect } = require("chai");


const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
require("@nomiclabs/hardhat-web3");
const hre = require("hardhat");
const _ = require('underscore');



describe("Moxie Cards", function() {


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

  var ERC20Fids  = [1,2,3,4,5,6,7,8,9,10]
  var FidCoins = {}


  const decStr = "000000000000000000";
  const blnbln = "1000000000000000000";
  var degenSupply = 1000000000000000 + decStr

  const protocolFeePercent = "20000000000000000" // protocolFeePercent subjectFeePercent
  const subjectFeePercent = "20000000000000000"

  const delay = ms => new Promise(res => setTimeout(res, ms));

  var address2addressID = {};

  //Deploy the token 
  before(async function() {



      [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, ...addrs] = await ethers.getSigners(25);

      diffAccounts = await ethers.getSigners(25);

      for(let i = 0; i < diffAccounts.length; i++) {
        address2addressID[diffAccounts[i].address] = i;
      }


      //MoxieOracle = await ethers.getContractFactory("MoxieOracle");
      MoxieTokenManager = await ethers.getContractFactory("MoxieTokenManager");
      MoxieCards = await ethers.getContractFactory("FarfantasyMoxieCards");
      MoxieDecks = await ethers.getContractFactory("FarfantasyMoxieDecks");
      
      ERC20 = await ethers.getContractFactory("ERC20");

      for(let fid of ERC20Fids) {
        var _supply = (fid * fid * 1000) + decStr;
        var _fid_coin = await ERC20.deploy("FID COIN :: " + fid, "FID" + fid , 18, _supply);
        console.log("FID COIN :: " + fid, "FID" + fid , 18, _supply, " :: Deployed at ::", _fid_coin.target);
        FidCoins[fid] = _fid_coin;
      }

      //Moxie Token 
      moxieToken = await ERC20.deploy("Moxie Token", "MOXIE", 18, degenSupply);
      console.log("Moxie Token Deployed at ::", moxieToken.target);

      //moxieOracle = await MoxieOracle.deploy();
      //console.log("MoxieOracle Deployed at ::", moxieOracle.target);

      moxieTokenManager = await MoxieTokenManager.deploy();
      console.log("MoxieTokenManager Deployed at ::", moxieTokenManager.target);

      moxieCards = await MoxieCards.deploy();
      console.log("MoxieCards Deployed at ::", moxieCards.target);

      moxieDecks = await MoxieDecks.deploy(moxieToken.target, moxieCards.target);
      console.log("MoxieDecks Deployed at ::", moxieDecks.target);

      for(let fid of ERC20Fids) {
        await moxieTokenManager.connect(owner).setToken(FidCoins[fid].target, FidCoins[fid].target);

      }


      console.log();
      console.log();
      console.log();
      console.log();
  });

  

  
  describe("Setup the Moxie Oracle", async function() {


      it("Non owner should not able to set the oracle", async function() {
          var txn = moxieCards.connect(addr1).updateSubjectERC20FID(FidCoins[1].target, 1);
          await expect(txn).to.be.reverted

          var txn = moxieCards.connect(addr1).updateSubjectERC20FIDBulk([FidCoins[1].target, FidCoins[2].target, FidCoins[3].target], [1,2,3]);
          await expect(txn).to.be.reverted
      });

      it("Admin should able to do the Oracle Stuffs", async function() {
        var timestamp = await time.latest();
        var txn = await moxieCards.connect(owner).updateSubjectERC20FID(FidCoins[1].target, 1);
        await expect(txn).to.emit(moxieCards, 'MappedFT2FID').withArgs(FidCoins[1].target, 1, timestamp + 1);

        var FidCoinsAddresses = _.values(FidCoins);
        FidCoinsAddresses = _.pluck(FidCoinsAddresses, 'target');
        
        var timestamp = await time.latest();        
        var txn = await moxieCards.connect(owner).updateSubjectERC20FIDBulk(FidCoinsAddresses, ERC20Fids);
        await expect(txn).to.emit(moxieCards, 'MappedFT2FID').withArgs(FidCoins[1].target, 1, timestamp + 1);

        await moxieCards.connect(owner).setFanTokenManager(moxieTokenManager.target);

        //await moxieTokenManager.connect(owner).setMoxieToken(moxieToken.target);
        

      });
  });

  describe("Minting the Cards", async function() {
        it("Single Minting Negative test", async function() {
          var _value = "90" + decStr;
          var send = await FidCoins[3].connect(owner).transfer(addr2.address, _value);
          var approve = await FidCoins[3].connect(addr2).approve(moxieCards.target, _value);

          var txn =  moxieCards.connect(addr2).mint(FidCoins[3], 21);

          await expect(txn).to.be.reverted

          var txn =  moxieCards.connect(addr2).mint(FidCoins[4], 0);
          await expect(txn).to.be.revertedWith("Invalid Cards");

          var txn =  moxieCards.connect(addr2).mint(moxieCards.target, 1);
          await expect(txn).to.be.revertedWith("Invalid Subject");          
        })





        it("Able to mint single stuffs ", async function() {

          var _value = "1000" + decStr;
          var send = await FidCoins[1].connect(owner).transfer(addr1, _value);
          var approve = await FidCoins[1].connect(addr1).approve(moxieCards.target, _value);

          var _value = "1000" + decStr;
          var send = await FidCoins[2].connect(owner).transfer(addr1, _value);
          var approve = await FidCoins[2].connect(addr1).approve(moxieCards.target, _value);


          //await getEligibleCards(1, addr1.address, 1);
          var balances_before = await FT_balances([1,2], [addr1.address, addr4.address, moxieCards.target], "Before");

          //For FID 1
          var timestamp = await time.latest();
          var txn = await moxieCards.connect(addr1).mint(FidCoins[1], 2);
          var _fees_amount = await getFees(1, 2);
          await expect(txn).to.emit(moxieCards, 'MoxieCard').withArgs(addr1.address, FidCoins[1], 1, 2, _fees_amount, true, timestamp + 1);
          var balance = await FidCoins[1].balanceOf(moxieCards.target);
          expect(balance.toString()).to.equal(_fees_amount);

          var balances_before = await FT_balances([1,2], [addr1.address, addr4.address, moxieCards.target], "After Buying FID 1 with 2 cards");


          var timestamp = await time.latest();
          var txn = await moxieCards.connect(addr1).mint(FidCoins[1], 2);
          await expect(txn).to.emit(moxieCards, 'MoxieCard').withArgs(addr1.address, FidCoins[1], 1, 2, _fees_amount,true, timestamp + 1);
          var balance = await FidCoins[1].balanceOf(moxieCards.target);
          _fees_amount = await getFees(1, 4);
          expect(balance.toString()).to.equal(_fees_amount);
          var _lockedFT = await moxieCards.lockedFT(FidCoins[1], addr1);
          expect(_lockedFT.toString()).to.equal(_fees_amount);
          var balances_before = await FT_balances([1,2], [addr1.address, addr4.address, moxieCards.target], "After Buying FID 1 with 2 cards");
          


          //Now for FID 2 
          var timestamp = await time.latest();
          var txn = await moxieCards.connect(addr1).mint(FidCoins[2], 1);
          var _fees_amount = await getFees(2, 1);
          await expect(txn).to.emit(moxieCards, 'MoxieCard').withArgs(addr1.address,FidCoins[2], 2, 1, _fees_amount, true, timestamp + 1);
          var balance = await FidCoins[2].balanceOf(moxieCards.target);
          expect(balance.toString()).to.equal(_fees_amount);
          var balances_before = await FT_balances([1,2], [addr1.address, addr4.address, moxieCards.target], "After Buying FID 2 with 1 cards");


          await FidCoins[2].connect(owner).mint(addr1.address, "10000" + decStr);

          var timestamp = await time.latest();
          var txn = await moxieCards.connect(addr1).mint(FidCoins[2].target, 1);
          var _fees_amount_2 = await getFees(2, 1);
          await expect(txn).to.emit(moxieCards, 'MoxieCard').withArgs(addr1.address, FidCoins[2], 2, 1, _fees_amount_2, true, timestamp + 1);
          var balance = await FidCoins[2].balanceOf(moxieCards.target);
          var balances_before = await FT_balances([1,2], [addr1.address, addr4.address, moxieCards.target], "After Buying FID 2 with 1 cards");

          
          var bn_fee_amount_1 = new BN(_fees_amount);
          var bn_fee_amount_2 = new BN(_fees_amount_2);
          var bn_total_fee = bn_fee_amount_1.add(bn_fee_amount_2);

          expect(balance.toString()).to.equal(bn_total_fee.toString());


          //var balance = await degen.balanceOf(depopo.target);
          //expect(balance.toString()).to.equal(amount);

        });
    
        it("Able to mint Multiple bulk stuffs ", async function() {
          var _value = "2000" + decStr;
          var send = await FidCoins[3].connect(owner).transfer(addr4, _value);
          var approve = await FidCoins[3].connect(addr4).approve(moxieCards.target, _value);

          var _value = "1000" + decStr;
          var send = await FidCoins[2].connect(owner).transfer(addr4, _value);
          var approve = await FidCoins[2].connect(addr4).approve(moxieCards.target, _value);

          var balances_before = await FT_balances([2,3], [addr1.address, addr4.address, moxieCards.target], "Before Bulk Minting");

          //var timestamp = await time.latest();
          var timestamp = await time.latest();
          var txn = await moxieCards.connect(addr4).mintBatch([FidCoins[3].target,FidCoins[2].target], [2,1]);
          var _fees_amount_1 = await getFees(3, 2);
          var _fees_amount_2 = await getFees(2, 1);

          var balances_before = await FT_balances([2,3], [addr1.address, addr4.address, moxieCards.target], "After Bulk Minting 3:2, 2:1");


          await expect(txn).to.emit(moxieCards, 'MoxieCard').withArgs(addr4.address, FidCoins[3], 3, 2, _fees_amount_1, true, timestamp + 1);
          await expect(txn).to.emit(moxieCards, 'MoxieCard').withArgs(addr4.address, FidCoins[2], 2, 1, _fees_amount_2, true, timestamp + 1);


        });

        it("Negative tests for burn", async function() {
          var txn =  moxieCards.connect(addr7).burn(addr7.address, 1);
          await expect(txn).to.be.revertedWith("Invalid Subject");

          var txn =  moxieCards.connect(addr7).burn(FidCoins[1].target, 0);
          await expect(txn).to.be.revertedWith("Invalid Cards");

          var txn =  moxieCards.connect(addr7).burn(FidCoins[1].target, 1);
          await expect(txn).to.be.revertedWith("Insufficient cards balance");
        });
    
        it("Able to burn single stuffs ", async function() {
          var timestamp = await time.latest();
          var txn = await moxieCards.connect(addr1).burn(FidCoins[1].target, 1);
          var _fees_amount = getFees(1, 1);
          await expect(txn).to.emit(moxieCards, 'MoxieCard').withArgs(addr1.address,FidCoins[1], 1, 1, _fees_amount, false, timestamp + 1);
          var balances_before = await FT_balances([1], [addr1.address, addr4.address, moxieCards.target], "After Selling 1:1");

        });
    
        it("Able to burn Bulk stuffs ", async function() {
          var timestamp = await time.latest();
          var txn = await moxieCards.connect(addr4).burnBatch([FidCoins[3].target,FidCoins[2].target], [2,1]);
          var _fees_amount_1 = await getFees(3, 2);
          var _fees_amount_2 = await getFees(2, 1);
          await expect(txn).to.emit(moxieCards, 'MoxieCard').withArgs(addr4.address, FidCoins[3], 3, 2, _fees_amount_1, false, timestamp + 1);
          await expect(txn).to.emit(moxieCards, 'MoxieCard').withArgs(addr4.address, FidCoins[2], 2, 1, _fees_amount_2, false, timestamp + 1);
          var balances_before = await FT_balances([2,3], [addr1.address, addr4.address, moxieCards.target], "After Selling 2:1, 3:2");

        });

        it("Should not able to transfer the NFT to non whitelisted contract.", async function() {
          var txn =  moxieCards.connect(addr1).safeTransferFrom(addr1.address, moxieDecks.target, 2, 1, "0x00");
          await expect(txn).to.be.reverted;
        });

        it("Should able to transfer the NFT to whitelisted contract.", async function() {
          //Whitelist a contract 
          var txn = await moxieCards.connect(owner).whitelistContracts(moxieDecks.target, true);

          var txn =  await moxieCards.connect(addr1).safeTransferFrom(addr1.address, moxieDecks.target, 2, 1, "0x00");
          await expect(txn).to.emit(moxieCards, 'TransferSingle').withArgs(addr1.address, addr1.address, moxieDecks.target, 2, 1);

          var balances_before = await FT_balances([2,3], [addr1.address, addr4.address, moxieCards.target, moxieDecks.target], "After Transfer 2:1");

        })

        it("Try burn after transfer to another account.", async function() {
          var txn =  moxieCards.connect(addr1).burn(FidCoins[2].target, 2);
          await expect(txn).to.be.revertedWith("Insufficient cards balance");

          var txn =  await moxieCards.connect(addr1).burn(FidCoins[2].target, 1);
          var balances_before = await FT_balances([2,3], [addr1.address, addr4.address, moxieCards.target, moxieDecks.target], "After Burn 2:1");
        });

        it("Try burn from non minted account.", async function() {
          var txn = await moxieCards.connect(addr4).mintBatch([FidCoins[2].target, FidCoins[3].target], [1,2]);
          var balances_before = await FT_balances([2,3], [addr1.address, addr4.address, moxieCards.target, moxieDecks.target], "After Minting 2:1, 3:2");

          var txn =  await moxieCards.connect(addr4).safeTransferFrom(addr4.address, addr1.address, 3, 1, "0x00");
          var balances_before = await FT_balances([2,3], [addr1.address, addr4.address, moxieCards.target], "After Transfering 3:1");

          var txn =   moxieCards.connect(addr1).burn(FidCoins[3].target, 1);
          await expect(txn).to.be.revertedWith("Mismatch Mints");

          var balances_before = await FT_balances([2,3], [addr1.address, addr4.address, moxieCards.target], "After Burining 3:1");

        });

        it("Test the variable supply balance of FT.", async function() {

          console.log()
          console.log()

          var fid = 6

          //Mint FID 4 
          var _value = "1000" + decStr;
          var send = await FidCoins[fid].connect(owner).transfer(addr5, _value);
          var approve = await FidCoins[fid].connect(addr5).approve(moxieCards.target, "100000" + _value);

          var balances_before = await FT_balances([fid], [addr5.address, moxieCards.target], "Before Buying FID ${fid}:1");

          var timestamp = await time.latest();
          var txn = await moxieCards.connect(addr5).mint(FidCoins[fid], 1);
          var _fees_amount = await getFees(fid, 1);
          await expect(txn).to.emit(moxieCards, 'MoxieCard').withArgs(addr5.address, FidCoins[fid], fid, 1, _fees_amount, true, timestamp + 1);
          var balance = await FidCoins[fid].balanceOf(moxieCards.target);
          expect(balance.toString()).to.equal(_fees_amount);

          var balances_before = await FT_balances([fid], [addr5.address, moxieCards.target], "After Buying FID ${fid}:1");

          //Mint more FidCoins
          var timestamp = await time.latest();
          await FidCoins[fid].connect(owner).mint(owner.address, "36000" + decStr);
          var balances_before = await FT_balances([fid], [addr5.address, moxieCards.target], "After Minting 36000 money");
          var txn = await moxieCards.connect(addr5).mint(FidCoins[fid], 1);
          var balances_before = await FT_balances([fid], [addr5.address, moxieCards.target], "After Buying FID ${fid}:1");


          //Mint more FidCoins
          var timestamp = await time.latest();
          await FidCoins[fid].connect(owner).mint(addr5.address, "186000" + decStr);
          var balances_before = await FT_balances([fid], [addr5.address, moxieCards.target], "After Minting 186000 money");
          var txn = await moxieCards.connect(addr5).mint(FidCoins[fid], 1);
          var balances_before = await FT_balances([fid], [addr5.address, moxieCards.target], "After Buying FID ${fid}:1");       
          
          //Now buring the cards
          var txn = await moxieCards.connect(addr5).burn(FidCoins[fid].target, 1);
          var balances_before = await FT_balances([fid], [addr5.address, moxieCards.target], "After Selling FID ${fid}:1");
          
        });


    
  });

  describe("Moxie Decks", async function() {

    var freeDecks = 10
    var deckIDStart = 1000000000;


    it("Admin Settings.", async function() {
        //Check if the free decks are set and right 
        var _freedecks = await moxieDecks.connect(owner).FreeDecks();
        await expect(_freedecks).to.be.equal(freeDecks);

        var newFreeDecks = 1;
        //Change the free decks
        var setFreeDecks = await moxieDecks.connect(owner).setFreeDecks(newFreeDecks);
        var _freedecks = await moxieDecks.connect(owner).FreeDecks();
        await expect(_freedecks).to.be.equal(newFreeDecks);

        var setFreeDecks = moxieDecks.connect(addr1).setFreeDecks(2);        
        await expect(setFreeDecks).to.be.reverted;

        //Get the owner of the contract
        var _owner = await moxieDecks.owner();
        await expect(_owner).to.be.equal(owner.address);

        //Transfer some ourcoins to addr1 
        var _value = "100000000000000000000000000";
        var transfer = await moxieToken.connect(owner).transfer(moxieDecks.target, _value);
        var balance = await moxieToken.balanceOf(moxieDecks.target);
        await expect(balance).to.be.equal(_value);

        //Non admin trying to withdraw that ERC20 token
        var withdraw = moxieDecks.connect(addr1).withdrawERC20(moxieToken.target, _value);
        await expect(withdraw).to.be.reverted;

        var balanceCheck = await moxieToken.balanceOf(moxieDecks.target);
        await expect(balanceCheck).to.be.equal(_value);

        //Admin trying to withdraw that ERC20 token
        var withdraw = await moxieDecks.connect(owner).withdrawERC20(moxieToken.target, _value);
        //await expect(withdraw).to.emit(ffttss1, 'Withdrawn').withArgs(moxieToken.target, _value);

        var balanceCheck = await moxieToken.balanceOf(moxieDecks.target);
        await expect(balanceCheck).to.be.equal(0);

    });

    it("Deck Create Negative", async function() {
      //try create a deck with 0 cards
      var cards = [2,3,4,5];

      for(let i of cards) {
          var partil_cards = cards.slice(0, i);
          var txn = moxieDecks.connect(addr1).deckCreate(partil_cards);
          await expect(txn).to.be.revertedWith("Invalid count");
      }

      //try create a deck with duplicate cards
      var duplicate_cards = [2,2,3,4];
      var txn = moxieDecks.connect(addr1).deckCreate(duplicate_cards);
      await expect(txn).to.be.revertedWith("Duplicate cards");

      //try with too many cards 
      var too_many_cards = [2,3,4,5,6,7,8,9,10,11];
      var txn = moxieDecks.connect(addr1).deckCreate(too_many_cards);
      await expect(txn).to.be.revertedWith("Invalid count");

      //try with too many cards but duplicates 
      var too_many_cards = [2,3,4,5,6, 2,3,4,5,6];
      var txn = moxieDecks.connect(addr1).deckCreate(too_many_cards);
      await expect(txn).to.be.revertedWith("Duplicate cards");

      //try with cards that do not exists  
      var too_many_cards = [1112,1113,1114,1115,1116]
      var txn = moxieDecks.connect(addr1).deckCreate(too_many_cards);
      await expect(txn).to.be.reverted;
      


    });    

    it("Deck Create Positive", async function() {
      //Lets create a deck 
      var deckName = "test"



      var FreeDecks = await moxieDecks.FreeDecks();

      console.log("Free Decks :: ", FreeDecks);

      //var setFreeDecks = await moxieDecks.connect(owner).setFreeDecks(12);
      //move some moxie token to the decks contract
      var _value = "100000000000000000000000000";
      var transfer = await moxieToken.connect(owner).transfer(addr1.address, _value);
      var degen_allow = await moxieToken.balanceOf(addr1.address);  
      var approve = await moxieToken.connect(addr1).approve(moxieDecks.target, degen_allow.toString() + "0000000");


      var cards = [2,3,4,5,6];

      var cardBalanceInventory = {}
      var cardBalanceInventoryUsage = {}
      var cardBalanceInventorywallet = {}

      //fill the user wallet with cards
      for(let card of cards) {
          var _value = "1000000" + decStr;
          //Mint the FT 
          await FidCoins[card].connect(owner).mint(addr1.address, _value);
          //Approve the FT
          var approve = await FidCoins[card].connect(addr1).approve(moxieCards.target, _value)

          //Mint the NFT
          var txn = await moxieCards.connect(addr1).mint(FidCoins[card], 30);
      }

      for(let card of cards) {
          //var inventory = await moxieDecks.cardsBalances(addr1.address, card);
          //cardBalanceInventory[card] = inventory;
          //cardBalanceInventoryUsage[card] = 0;


          var walletBalance = await moxieCards.balanceOf(addr1.address, card);
          cardBalanceInventorywallet[card] = walletBalance;
      }

      //console.log("Card Balance Inventory :: ", cardBalanceInventory);

      //@tood 
      //check if balance, usage, card data all matching correctly 

      var _counter = [1,2,3,4,5,6];
      var iteration = 0;

      //Give approvalforall 
      var approve = await moxieCards.connect(addr1).setApprovalForAll(moxieDecks.target, true);


      for(let i of _counter) {
          //Current deck ID stuffs
          var deckID = await moxieDecks.connect(addr1).DeckID();
          await expect(deckID).to.be.equal(deckIDStart + i - 1);

          var fees2pay = ffttss_price(FreeDecks.toString(), i-1);   
          
          console.log("Deck ID :: ", i, deckID.toString(), fees2pay);


          var degen_balance_before = await moxieToken.balanceOf(addr1.address);
          var degen_balance_before_game = await moxieToken.balanceOf(moxieDecks.target);

          //console.log("Deck ID :: ", i, deckID.toString(), fees2pay.toString());
          const timestamp = await time.latest();

          var txn = await moxieDecks.connect(addr1).deckCreate(cards);
          //get current timestamp 
          //var timestamp = Math.floor(Date.now() / 1000);
          //fees2pay = 0;
          await expect(txn).to.emit(moxieDecks, 'DeckCreated').withArgs(addr1.address, deckIDStart+i, fees2pay + "000000000000000000", timestamp + 1, cards);

          var degen_balance_after = await moxieToken.balanceOf(addr1.address);
          var degen_balance_after_game = await moxieToken.balanceOf(moxieDecks.target);

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
              var walletBalance = await moxieCards.balanceOf(addr1.address, card);
              var usage = await moxieDecks.cardsUsage(addr1.address, card);
              //console.log("Card :: ", card, iteration, walletBalance, inventory,  cardBalanceInventory[card], usage);
              //console.log("Card :: ", card, iteration, inventory,  cardBalanceInventory[card], usage);
              await expect(usage).to.be.equal(iteration + 1);

              //console.log("Card :: ", card, iteration, cardBalanceInventorywallet[card], cardBalanceInventory[card], inventory,  walletBalance,  usage);

              //console.log("Card :: ", card, iteration, cardBalanceInventorywallet[card], cardBalanceInventory[card], walletBalance,  usage);

              await expect(parseInt(cardBalanceInventorywallet[card])).to.be.equal(parseInt(walletBalance) + parseInt(usage));
          }

          iteration++;
      }

      var lastDeckID = await moxieDecks.connect(addr1).DeckID();
      for(let i = 0; i < 5; i++) {
          var deckCard = await moxieDecks.deckCards(lastDeckID, i);
          await expect(deckCard).to.be.equal(cards[i]);
          //console.log("Deck Cards :: ", i, deckCard);
      }


    });    

    it("Deck Edits Negative", async function() {
      //Different user should not edit the deck   
      var new_deck_items = [7,8,9,10,11];
      var lastDeckID = await moxieDecks.connect(addr1).DeckID();        
      var txn =   moxieDecks.connect(addr2).deckEdit(lastDeckID, new_deck_items);
      await expect(txn).to.be.revertedWith("Not your deck");

      //Should not able to edit with 0 cards
      
      var txn = moxieDecks.connect(addr1).deckEdit(lastDeckID, []);
      await expect(txn).to.be.revertedWith("Invalid Count");

      //Should not able to edit with duplicate cards
      var txn = moxieDecks.connect(addr1).deckEdit(lastDeckID, [2,2,3,4,5]);
      await expect(txn).to.be.revertedWith("Duplicate cards");

      //Try with too many cards
      var txn = moxieDecks.connect(addr1).deckEdit(lastDeckID, [2,3,4,5,6,7,8,9,10,11]);
      await expect(txn).to.be.revertedWith("Invalid Count");

      //check what if we can edit withsame cards 
      //var txn = await ffttss1.connect(addr1).deckEdit(lastDeckID, [2,3,4,5,6]);
      var too_many_cards = [1112,1113,1114,1115,1116]
      var txn = moxieDecks.connect(addr1).deckCreate(too_many_cards);
      await expect(txn).to.be.reverted;
    });    

    it("Deck Edits Positive", async function() {
      //Test how the inventorys are not affecting while editing the deck 
      var fids = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

      var lastDeckID = await moxieDecks.connect(addr1).DeckID();

      var deckView = await moxieDecks.deckView(lastDeckID);

      
      var lastDeckItems = deckView
      
      var new_deck_items = [6,7,8,9,10];
      var old_deck_items = deckView
      
      var timestamp = await time.latest();


      //Get the wallet balance and card useage of new deck items 
      var newCardUsageBefore = {};
      var newCardWalletBefore = {};

      for(let card of new_deck_items) {
        var _value = "1000000" + decStr;
        //Mint the FT 
        await FidCoins[card].connect(owner).mint(addr1.address, _value);
        //Approve the FT
        var approve = await FidCoins[card].connect(addr1).approve(moxieCards.target, _value)

        //Mint the NFT
        var txn = await moxieCards.connect(addr1).mint(FidCoins[card], 30);
    }      

      for(let card of new_deck_items) {
          var usage = await moxieDecks.cardsUsage(addr1.address, card);
          var wallet = await moxieCards.balanceOf(addr1.address, card);
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
          var usage = await moxieDecks.cardsUsage(addr1.address, card);
          //var inventory = await moxieDecks.cardsBalances(addr1.address, card);
          var wallet = await moxieCards.balanceOf(addr1.address, card);

          cardUsageBefore[card] = usage;
          cardInventoryBefore[card] = 0n;
          cardWalletBefore[card] = wallet;
      }
      var timestamp = await time.latest();
      var txn =  moxieDecks.connect(addr1).deckEdit(lastDeckID, new_deck_items);
      await expect(txn).to.emit(moxieDecks, 'DeckEdited').withArgs(addr1.address, lastDeckID, timestamp+ 1, new_deck_items);

      var cardUsageAfter = {};
      var cardInventoryAfter = {};
      var cardWalletAfter = {};

      for(let card of deckView) {
          var usage = await moxieDecks.cardsUsage(addr1.address, card);
          var inventory = new BN(0)//await moxieDecks.cardsBalances(addr1.address, card);
          var wallet = await moxieCards.balanceOf(addr1.address, card);

          cardUsageAfter[card] = usage;
          cardInventoryAfter[card] = inventory;
          cardWalletAfter[card] = wallet;
      }        

      for(let card of deckView) {
          //console.log("Card :: ", card, cardUsageBefore[card], cardInventoryBefore[card], cardWalletBefore[card], cardUsageAfter[card], cardInventoryAfter[card], cardWalletAfter[card]);

          await expect(cardUsageBefore[card] + cardWalletBefore[card]).to.be.equal(cardUsageAfter[card] + cardWalletAfter[card]);
          //await expect(cardInventoryBefore[card]).to.be.equal(cardInventoryAfter[card]);
          //await expect(cardWalletBefore[card]).to.be.equal(cardWalletAfter[card]);

      }


      //Check the wallet balance and card useage of new deck items
      var newCardUsageAfter = {};
      var newCardWalletAfter = {};

      for(let card of new_deck_items) {
          var usage = await moxieDecks.cardsUsage(addr1.address, card);
          var wallet = await moxieCards.balanceOf(addr1.address, card);
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
      var lastDeckID = await moxieDecks.connect(addr1).DeckID();        
      var txn =   moxieDecks.connect(addr2).deckDelete(lastDeckID);
      await expect(txn).to.be.revertedWith("Not your deck");

      //Check if the deck is already removed 
      //var txn = ffttss1.connect(addr1).deckRemove(lastDeckID);
      //await expect(txn).to.be.revertedWith("Deck already removed");

      var deck_to_delete = deckIDStart + 4
      var timestamp = await time.latest();

      //get the deck items
      var deckView = await moxieDecks.deckView(deck_to_delete);

      //get the card usage and wallet balance of the deck items
      var cardUsageBefore = {};
      var cardInventoryBefore = {};
      var cardWalletBefore = {};

      for(let card of deckView) {
          var usage = await moxieDecks.cardsUsage(addr1.address, card);
          var inventory = 0n//await moxieDecks.cardsBalances(addr1.address, card);
          var wallet = await moxieCards.balanceOf(addr1.address, card);

          cardUsageBefore[card] = usage;
          cardInventoryBefore[card] = inventory;
          cardWalletBefore[card] = wallet;
      }


      var txn =   moxieDecks.connect(addr1).deckDelete(deck_to_delete);
      await expect(txn).to.emit(moxieDecks, 'DeckDeleted').withArgs(addr1.address, deck_to_delete, timestamp + 1);

      //Get the card usage and wallet balance of the deck items
      var cardUsageAfter = {};
      var cardInventoryAfter = {};
      var cardWalletAfter = {};

      for(let card of deckView) {
          var usage = await moxieDecks.cardsUsage(addr1.address, card);
          var inventory = 0n//await moxieDecks.cardsBalances(addr1.address, card);
          var wallet = await moxieCards.balanceOf(addr1.address, card);

          cardUsageAfter[card] = usage;
          cardInventoryAfter[card] = inventory;
          cardWalletAfter[card] = wallet;
      }

      //Check the balance in usage, in inventory and in wallet
      for(let card of deckView) {
          await expect(cardUsageBefore[card] + cardWalletBefore[card]).to.be.equal(cardUsageAfter[card] + cardWalletAfter[card]);
          //await expect(cardInventoryBefore[card]).to.be.equal(cardInventoryAfter[card]);
          //await expect(cardWalletBefore[card]).to.be.equal(cardWalletAfter[card]);

      }


      var deckView = await moxieDecks.deckView(deck_to_delete);


      var txn =   moxieDecks.connect(addr1).deckDelete(deck_to_delete);
      await expect(txn).to.be.revertedWith("Not your deck");

  })    

  it("ETH Withdrawals", async function() {
    //Send some ETH to the contract
    var _value = "10000000000000000000";
    var send = await owner.sendTransaction({to: moxieDecks.target, value: _value});

    //Get the eth balance of the contract
    var balance = await ethers.provider.getBalance(moxieDecks.target);
    await expect(balance).to.be.equal(_value);

    //Non admin trying to withdraw the ETH
    var withdraw = moxieDecks.connect(addr1).withdrawETH();
    await expect(withdraw).to.be.reverted;

    //Admin trying to withdraw the ETH
    var withdraw = await moxieDecks.connect(owner).withdrawETH();
    

    //Get the ETH balance of the contract
    var balance = await ethers.provider.getBalance(moxieDecks.target);
    await expect(balance).to.be.equal(0);
    

});  

  })

  function ffttss_price(FreeDecks = 1, DeckCounts = 0, DeckInitialPrice = 1000, PriceIncrement = 1000) {
    if(DeckCounts < FreeDecks) {
        return 0;
    }
    return DeckInitialPrice + (DeckInitialPrice * PriceIncrement * (DeckCounts - FreeDecks) / 10000);
}  

  //Get the balances of multiple tokens for multiple addresses
  async function FT_balances(tokens, addresses, debug_test) {
    if(!_.isArray(tokens)) {
      tokens = [tokens];
    }

    if(!_.isArray(addresses)) {
      addresses = [addresses];
    }

    var balances = {};
    for(let fid of tokens) {
      var token = FidCoins[fid];

      var totalSupply = new BN(await token.totalSupply());
      totalSupply = parseInt(totalSupply.div(new BN(blnbln)).toString());


      balances[fid] = {
        "Total Supply": totalSupply,
        "Card Supply": parseInt(await moxieCards.totalSupply(fid)),
      };
      for(let address of addresses) {
        //GET FT BALANCE
        var _balance = new BN(await token.balanceOf(address));
        _balance = parseInt(_balance.div(new BN(blnbln)).toString());

        //FT LOCKED BALANCE
        var inventory_balance = new BN(await moxieCards.lockedFT(token.target, address));
        inventory_balance = parseInt(inventory_balance.div(new BN(blnbln)).toString());

        //NFT Card Balance
        var nft_card_balance = await moxieCards.balanceOf(address, fid);

        var _address_key = "Addr::" + _.get(address2addressID, address, address);

        balances[fid][_address_key] = _balance + " | " + inventory_balance + " | (" + nft_card_balance + ")";
      }
    }
    if(debug_test) {
      console.log();
      console.log(debug_test);
      console.table(balances);
    }
    return balances;
  }

  async function getFees(fid, cards) {
    var getTotalSupply = await FidCoins[fid].totalSupply();

    
    var BN_getTotalSupply = new BN(getTotalSupply.toString());
    var BN_cards = new BN(cards.toString());

    var Amount_Per_card = BN_getTotalSupply.mul(BN_cards).div(new BN(200));
    return Amount_Per_card.toString();
  }

  //Get eligible cards per user per fid based on supply and balance
  async function getEligibleCards(fid, user) {
    var getTotalSupply = await FidCoins[fid].totalSupply();
    var getBalance = await FidCoins[fid].balanceOf(user);

    var BN_getTotalSupply = new BN(getTotalSupply.toString());
    var BN_getBalance = new BN(getBalance.toString());

    var Amount_Per_card = BN_getTotalSupply.div(new BN(1000));
    var eligible_cards = BN_getBalance.div(Amount_Per_card);

    return parseInt(eligible_cards.toString());

  }


  function paymentsPerPayout(amount, payout) {
    var _amount = new BN(amount);
    var _payout = new BN(payout);
    var _payments = _amount.mul(_payout).div(new BN(10000));
    return _payments.toString();
  }

});