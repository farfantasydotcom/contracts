// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/StorageSlot.sol)
// This file was procedurally generated from scripts/generate/templates/StorageSlot.js.




/* 
    Twitter : https://x.com/farfantasycom
    Telegram : https://t.me/FarFantasyCom
    Farcaster Channel : https://warpcast.com/~/channel/farfantasy
    Website : https://farfantasy.com/
    Linktree : https://linktr.ee/FarFantasyCom
    Base Mainet Deployed Address : 
    Dev: https://warpcast.com/farkeysdev
*/

/*


███████╗ █████╗ ██████╗ ███████╗ █████╗ ███╗   ██╗████████╗ █████╗ ███████╗██╗   ██╗
██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗████╗  ██║╚══██╔══╝██╔══██╗██╔════╝╚██╗ ██╔╝
█████╗  ███████║██████╔╝█████╗  ███████║██╔██╗ ██║   ██║   ███████║███████╗ ╚████╔╝ 
██╔══╝  ██╔══██║██╔══██╗██╔══╝  ██╔══██║██║╚██╗██║   ██║   ██╔══██║╚════██║  ╚██╔╝  
██║     ██║  ██║██║  ██║██║     ██║  ██║██║ ╚████║   ██║   ██║  ██║███████║   ██║   
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚══════╝   ╚═╝   
                                                                                    

*/

pragma solidity ^0.8.26;


/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
    */
    function transfer(address recipient, uint256 amount) external returns (bool); 

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

}

/**
 * @dev Required interface of an ERC1155 compliant contract, as defined in the
 * https://eips.ethereum.org/EIPS/eip-1155[EIP].
 */
interface IFarFantasyCards {
    function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes calldata data) external;

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external;    

}

//FarFantasy Tournament, The Satosi Session 1
contract FFTTSSOne is Ownable {

    //Max cards per deck
    uint256 public constant CARDS_PER_DECK = 5; 

    //Deck ID
    uint256 public DeckID;

    //Transfer Out settings 
    bool TransferOutEnabled = false;

    //Deck ID to Owner mapping
    mapping(uint256 => address) public Decks;

    //Users deck counts
    mapping(address => uint256) public DeckCounts;

    uint256 public FreeDecks;

    uint256 public PriceIncrement = 1000; //100 = 1%

    uint256 public DeckInitialPrice = 1000_000_000_000_000_000_000; //1000 Degen 

    //Card Counts per user
    //User => cards
    mapping(address => uint256) public cardCount;

    //Farfantasy Card balances per user per Hero 
    //User => fid => balance
    mapping(address => mapping(uint256 => uint256)) public cardsBalances;

    //Cards Used in decks 
    //user => fid => counts
    mapping(address => mapping(uint256 => uint256)) public cardsUsage;

    //mapping(uint256 => uint256) public cardsUsage;

    //Deck cards 
    mapping(uint256 => uint256[CARDS_PER_DECK]) public deckCards;

    //Farkeys contract
    IFarFantasyCards public farFantasyCard;

    //Degen token address
    IERC20 public DEGEN_CONTRACT; 
    
    constructor() Ownable(msg.sender) {
        DeckID = 0;

        //First 3 decks are free for everyone
        FreeDecks = 10;

        //Every new deck after 3, price goes up by 10% 
        PriceIncrement = 1000; //100 = 1%

        //Initial price of a deck is 1000 Degen
        DeckInitialPrice = 1_000_000_000_000_000_000_000; //1000 Degen

        //Degen token address
        DEGEN_CONTRACT = IERC20(0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed);

        //Far Fantasy Card contract
        farFantasyCard = IFarFantasyCards(0xEDD1c688d8E75849D52316237E6634E382b03310);

        //Transfer Out Enabled
        TransferOutEnabled = false;
    }
    
    
    /*
    constructor(address _degen_contract, address _farfantasycard_contract) Ownable(msg.sender) {
        DeckID = 0;

        //First 3 decks are free for everyone
        FreeDecks = 10;

        //Every new deck after 3, price goes up by 10% 
        PriceIncrement = 1000; //100 = 1%

        //Initial price of a deck is 1000 Degen
        DeckInitialPrice = 1_000_000_000_000_000_000_000; //1000 Degen

        //Degen token address
        DEGEN_CONTRACT = IERC20(_degen_contract);

        //Far Fantasy Card contract
        farFantasyCard = IFarFantasyCards(_farfantasycard_contract);

        //Transfer Out Enabled
        TransferOutEnabled = false;
    
    }
    */


    //events 
    event DeckCreated(address indexed user, uint256 indexed deckID, uint256 cost, uint256 timestamp, uint256[] cards);
    //Direction: true = out, false = in
    event CardsTransfered(address indexed user, uint256 indexed deckID, bool indexed direction, uint256[] keys, uint256[] amounts);


    //Create a deck
    //@tested
    function deckCreate(uint256[] calldata cards) public {
        //create a deck 
        require(isUniueArray(cards), "Duplicate cards");
        require(cards.length == CARDS_PER_DECK, "Invalid count");
        uint256 _cost = getPrice(_msgSender());
        if(_cost > 0) {
            require(DEGEN_CONTRACT.transferFrom(_msgSender(), address(this), _cost), "Unable to transfer Degen");
        }

        DeckID++;
        Decks[DeckID] = _msgSender();
        DeckCounts[_msgSender()]++;

        uint256[] memory toMove = new uint256[](CARDS_PER_DECK);
        uint256[] memory qty = new uint256[](CARDS_PER_DECK);
        uint256 counter = 0;        


        //edit the deck items 
        for(uint256 i = 0; i < cards.length; i++) {
            require(cards[i] > 0, "Invalid card");

            //Move the existing balance from to inventory
            if(cardsBalances[_msgSender()][cards[i]] > 0) {
                cardsBalances[_msgSender()][cards[i]]--;
            }
            else {
                toMove[counter] = cards[i];
                qty[counter] = 1;
                counter++;
                //How much cards the user have now
                cardCount[msg.sender]++;                
            }

            //Card inventory used in deck
            cardsUsage[_msgSender()][cards[i]]++;
            //Cards balance in deck 
            deckCards[DeckID][i] = cards[i];
        }
        //emit CardsTransfered(msg.sender, true, _keys, _amount);

        if(counter > 0) {
            farFantasyCard.safeBatchTransferFrom(_msgSender(), address(this), toMove, qty, "");
            emit CardsTransfered(_msgSender(), DeckID, true , toMove, qty);
        }

        emit DeckCreated(_msgSender(), DeckID, _cost, block.timestamp, cards);

    }

    //This edits a deck 
    //@tested
    event DeckEdited(address indexed user, uint256 indexed deckID, uint256 timestamp, uint256[] cards);
    function deckEdit(uint256 deckID, uint256[] calldata cards) public {
        require(Decks[deckID] == _msgSender(), "Not your deck");
        require(cards.length == CARDS_PER_DECK, "Invalid Count");
        require(isUniueArray(cards), "Duplicate cards");
        for(uint256 i = 0; i < CARDS_PER_DECK; i++) {
            require(cards[i] > 0, "Invalid card");

            //Move the existing balance from the usage to inventory
            uint256 _existing_card = deckCards[deckID][i];
            cardsUsage[_msgSender()][_existing_card]--;
            cardsBalances[_msgSender()][_existing_card]++;
        }

        uint256[] memory toMove = new uint256[](CARDS_PER_DECK);
        uint256[] memory qty = new uint256[](CARDS_PER_DECK);
        uint256 counter = 0;

        for(uint256 i = 0; i < CARDS_PER_DECK; i++) {

            if(cardsBalances[_msgSender()][cards[i]] > 0) {
                cardsBalances[_msgSender()][cards[i]]--;
            }
            else {
                toMove[counter] = cards[i];
                qty[counter] = 1;
                counter++;
                cardCount[msg.sender]++;                

            }
            cardsUsage[_msgSender()][cards[i]]++;
            deckCards[deckID][i] = cards[i];
        }

        if(counter > 0) {
            farFantasyCard.safeBatchTransferFrom(_msgSender(), address(this), toMove, qty, "");
            emit CardsTransfered(_msgSender(), DeckID, true, toMove, qty);
        }

        emit DeckEdited(_msgSender(), deckID, block.timestamp, cards);
    }

    //This deletes a deck
    //@tested
    event DeckDeleted(address indexed user, uint256 indexed deckID, uint256 timestamp);
    function deckDelete(uint256 deckID) public {
        require(Decks[deckID] == _msgSender(), "Not your deck");
        for(uint256 i = 0; i < CARDS_PER_DECK; i++) {
            uint256 _existing_card = deckCards[deckID][i];
            require(_existing_card > 0, "Invalid card");
            cardsUsage[_msgSender()][_existing_card]--;
            cardsBalances[_msgSender()][_existing_card]++;
            deckCards[deckID][i] = 0;
        }
        delete Decks[deckID];
        DeckCounts[_msgSender()]--;
        emit DeckDeleted(_msgSender(), deckID, block.timestamp);
    }

    //View the cards in deck 
    //@tested
    function deckView(uint256 deckID) public view returns (uint256[5] memory) {
        return deckCards[deckID];
    }

    

    //Helper function to transfer the keys to the contract 
    //@tested
    function transferCardsIn(uint256[] calldata _keys, uint256[] calldata _amount) public {
        require(_keys.length == _amount.length, "Mismatch");
        require(_keys.length > 0, "0 keys");
        farFantasyCard.safeBatchTransferFrom(msg.sender, address(this), _keys, _amount, "");
        for(uint256 i = 0; i < _keys.length; i++) {
            cardsBalances[msg.sender][_keys[i]] += _amount[i];
            cardCount[msg.sender] += _amount[i];
        }
        emit CardsTransfered(msg.sender, 0, true, _keys, _amount);

    }

    //Helper function to transfer the keys out of the contract
    //@tested
    function transferCardsOut(uint256[] calldata _keys, uint256[] calldata _amount) public {

        require(TransferOutEnabled, "Transfer Out Disabled");

        require(_keys.length == _amount.length, "Mismatch");
        require(_keys.length > 0, "0 keys");
        for(uint256 i = 0; i < _keys.length; i++) {
            require(cardsBalances[msg.sender][_keys[i]] >= _amount[i], "Not enough Cards");
            cardsBalances[msg.sender][_keys[i]] -= _amount[i];
            cardCount[msg.sender] -= _amount[i];
        }
        farFantasyCard.safeBatchTransferFrom(address(this), msg.sender, _keys, _amount, "");
        emit CardsTransfered(msg.sender, 0, false, _keys, _amount);
    }


    /************************************************************************************************
    ******************************************* Admin Operations ************************************
    ************************************************************************************************/
    //Helper function to set the transfer out status
    //@tested
    function setTransferOut(bool _status) public onlyOwner {
        TransferOutEnabled = _status;
    }

    //Owner should able to withdraw any ERC20 tokens
    //@tested 
    function withdrawERC20(address _token, uint256 _amount ) public onlyOwner{
        bool success = IERC20(_token).transfer(_msgSender(), _amount);
        require(success, "Unable to send funds");
    }

    //Withdraw ETH from the contract
    //@tested
    function withdrawETH() public onlyOwner {
        //Get the balance of the contract
        require(address(this).balance >= 0, "Insufficient balance");
        payable(_msgSender()).transfer(address(this).balance);
    }


    //Change the free decks count per user
    //@tested
    function setFreeDecks(uint256 _freeDecks) public onlyOwner {
        FreeDecks = _freeDecks;
    }

    //Change the price increment percentage per deck
    //@tested
    function setPriceIncrement(uint256 _priceIncrement) public onlyOwner {
        PriceIncrement = _priceIncrement;
    }

    //Change the DeckInitialPrice 
    //@tested
    function setDeckInitialPrice(uint256 _deckInitialPrice) public onlyOwner {
        DeckInitialPrice = _deckInitialPrice;
    }



    /************************************************************************************************
    ********************************* ERC1155 Receiver Functions ************************************
    ************************************************************************************************/

    //To receive the ERC1155 token
    //@tested
    function onERC1155Received(address, address, uint256, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    //To receive the ERC1155 tokens in batch
    //@tested
    function onERC1155BatchReceived(address, address, uint256[] memory, uint256[] memory, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    //Fallback function to receive the ETH
    //@tested
    event Received(address, uint);
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }


    /************************************************************************************************
    ******************************************* Helper function  ************************************
    ************************************************************************************************/
    //Get the deck price for a user
    function getPrice(address _user) public view returns (uint256) {
        if(DeckCounts[_user] < FreeDecks) {
            return 0;
        }
        return DeckInitialPrice + (DeckInitialPrice * PriceIncrement * (DeckCounts[_user] - FreeDecks) / 10000);
    }

    //Is it Unique Array, 0 is excluded
    function isUniueArray(uint256[] calldata _keys) internal pure returns (bool) {
        for(uint256 i = 0; i < _keys.length; i++) {
            for(uint256 j = i + 1; j < _keys.length; j++) {
                if(_keys[i] == _keys[j] && _keys[i] != 0) {
                    return false;
                }
            }
        }
        return true;
    }

}