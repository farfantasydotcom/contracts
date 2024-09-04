


    // SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC165 {
    function supportsInterface(bytes4 interfaceID)
        external
        view
        returns (bool);
}

interface IERC721 is IERC165 {
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId)
        external;
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId)
        external
        view
        returns (address operator);
    function setApprovalForAll(address operator, bool _approved) external;
    function isApprovedForAll(address owner, address operator)
        external
        view
        returns (bool);
}

interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
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

    //function buyKeysBulk(uint256[] memory ids, uint256[] memory amounts) external payable;
}

contract ERC721 is IERC721 {
    event Transfer(
        address indexed from, address indexed to, uint256 indexed id
    );
    event Approval(
        address indexed owner, address indexed spender, uint256 indexed id
    );
    event ApprovalForAll(
        address indexed owner, address indexed operator, bool approved
    );

    // Mapping from token ID to owner address
    mapping(uint256 => address) public _ownerOf;

    // Mapping owner address to token count
    mapping(address => uint256) internal _balanceOf;

    // Mapping from token ID to approved address
    mapping(uint256 => address) internal _approvals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) public isApprovedForAll;

    //Farkeys Card balances per user per key 
    //User => erc1155 ID => balance
    mapping(address => mapping(uint256 => uint256)) public cardsBalances;

    //Farkeys contract
    IFarFantasyCards public farFantasyCard;

    //Next Deck ID
    uint256 public deckID = 1;


    //Cards in the deck 
    //ERC721 Deck ID ID => Index => erc1155 ID
    mapping(uint256 => mapping(uint256 => uint256)) public deckCards;


    uint256 public constant MAX_CARDS = 5;


    //Events Declarations
    //op = 0 => create, op = 1 => edit, op = 2 => delete
    event Deck(uint8 indexed op, address indexed owner, uint256 indexed deckID, uint256[] keys);


    function supportsInterface(bytes4 interfaceId)
        external
        pure
        returns (bool)
    {
        return interfaceId == type(IERC721).interfaceId
            || interfaceId == type(IERC165).interfaceId;
    }

    function ownerOf(uint256 id) external view returns (address owner) {
        owner = _ownerOf[id];
        require(owner != address(0), "token doesn't exist");
    }

    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "owner = zero address");
        return _balanceOf[owner];
    }

    function setApprovalForAll(address operator, bool approved) external {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function approve(address spender, uint256 id) external {
        address owner = _ownerOf[id];
        require(
            msg.sender == owner || isApprovedForAll[owner][msg.sender],
            "not authorized"
        );

        _approvals[id] = spender;

        emit Approval(owner, spender, id);
    }

    function getApproved(uint256 id) external view returns (address) {
        require(_ownerOf[id] != address(0), "token doesn't exist");
        return _approvals[id];
    }

    function _isApprovedOrOwner(address owner, address spender, uint256 id)
        internal
        view
        returns (bool)
    {
        return (
            spender == owner || isApprovedForAll[owner][spender]
                || spender == _approvals[id]
        );
    }

    function transferFrom(address from, address to, uint256 id) public {
        require(from == _ownerOf[id], "from != owner");
        require(to != address(0), "transfer to zero address");

        require(_isApprovedOrOwner(from, msg.sender, id), "not authorized");

        _balanceOf[from]--;
        _balanceOf[to]++;
        _ownerOf[id] = to;

        delete _approvals[id];

        emit Transfer(from, to, id);
    }

    function safeTransferFrom(address from, address to, uint256 id) external {
        transferFrom(from, to, id);

        require(
            to.code.length == 0
                || IERC721Receiver(to).onERC721Received(msg.sender, from, id, "")
                    == IERC721Receiver.onERC721Received.selector,
            "unsafe recipient"
        );
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        bytes calldata data
    ) external {
        transferFrom(from, to, id);

        require(
            to.code.length == 0
                || IERC721Receiver(to).onERC721Received(msg.sender, from, id, data)
                    == IERC721Receiver.onERC721Received.selector,
            "unsafe recipient"
        );
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



    function _mint(address to, uint256[] calldata _keys) internal {
        require(to != address(0), "0 address");
        require(_ownerOf[deckID] == address(0), "ID Exist");

        _balanceOf[to]++;
        _ownerOf[deckID] = to;

        //Create the deck
        bool status = dkCreate(_keys, to, deckID);

        emit Transfer(address(0), to, deckID);
        deckID++;
        require(status, "deck creation failed");
    }



    function _burn(uint256 id, bool withdraw) internal {
        address owner = _ownerOf[id];
        require(owner != address(0), "not minted");

        _balanceOf[owner] -= 1; 
        _dkDelete(id, owner, withdraw);
        delete _ownerOf[id];
        delete _approvals[id];


        emit Transfer(owner, address(0), id);
    }

    //@notes:
    //  Take from both inventory and from user wallet by default 
    //  @todo: test
    function dkCreate(uint256[] calldata _keys, address _owner, uint256 _dkID) internal returns(bool status) {  
        status = false;
        require(_keys.length > 0, "no keys to form the deck");
        require(_keys.length <= MAX_CARDS, "Over Supply");
        require(isUniueArray(_keys), "Not Unique Array");

        //This contracts address 
        address _this = address(this);

        //New keys and amounts to be transferred from the user wallet to the contract
        uint256[] memory _keysNew = new uint256[](_keys.length);
        uint256[] memory _amountsNew = new uint256[](_keys.length);

        //Count of the new keys which needs to be transferred from the user wallet to the contract
        uint256 _countNewKeys = 0;



        //Index of cards in deck
        uint256 _i = 0;

        for(uint256 i = 0; i < _keys.length; i++) {
            //Make sure the key is not 0
            if(_keys[i] == 0) {
                continue;
            }
            if(cardsBalances[_owner][_keys[i]] > 0) {
                //Change the ownership of the card in the inventory from user's to contract's
                cardsBalances[_owner][_keys[i]]--;
            } else {
                //Take from the user wallet 
                _keysNew[_countNewKeys] = _keys[i];
                _amountsNew[_countNewKeys] = 1;
                _countNewKeys++;
            }

            

            //Add the keys to contract inventory
            cardsBalances[_this][_keys[i]]++;

            //form the deckCards
            deckCards[_dkID][_i] = _keys[i];

            //Increment the index
            _i++;

        }

        

        //Make sure that the deck has enough cards
        require(_i > 0, "Not enough cards");

        if(_countNewKeys > 0) {
            //Transfer the keys from the user wallet to the contract
            farFantasyCard.safeBatchTransferFrom(_owner, _this, _keysNew, _amountsNew, "");
        }
        //Emit the deck event
        emit Deck(0, _owner, _dkID, _keys);
        status = true;
    }

    
    //Edit the deck 
    function dkEdit(uint256 _dkID, uint256[] calldata _keysNew) public {
        address _owner = msg.sender;
        //Only owner should able to edit the deck
        require(_owner == _ownerOf[_dkID], "Denied");
        //Make sure that the new keys are not empty list 
        require(_keysNew.length > 0, "0 Keys");
        //Make sure that the new keys are not more than the max cards
        require(_keysNew.length <= MAX_CARDS, "Over Supply");
        //Make sure that the new keys are unique
        require(isUniueArray(_keysNew), "Not Unique");

        //This contracts address
        address _this = address(this);



        //First round of loop is for garbag collection
        for(uint256 i = 0; i < _keysNew.length; i++) {

            uint256 _key = deckCards[_dkID][i];

            //Skip if both new key and old key are same
            if(_key == _keysNew[i]) {
                continue;
            }

            //Delete the old key from the deck and add it back to the inventory
            if(_keysNew[i] == 0) {
                //Take that key back to the user inventory from the contract inventory 
                cardsBalances[_this][_key]--;
                //Add the key back to the user inventory
                cardsBalances[_owner][_key]++;
                //Delete the card from the deck 
                deckCards[_dkID][i] = 0;

                continue;
            }


            //Take back the old key to user inventory, from the contract inventory
            if(_key > 0) {
                cardsBalances[_this][_key]--;
                cardsBalances[_owner][_key]++;
            }
        }

        //uint256[] memory _keys;
        //uint256[] memory _amounts;
        uint256[] memory _keys = new uint256[](_keysNew.length);
        uint256[] memory _amounts = new uint256[](_keysNew.length);

        uint256 _countKeys = 0;

        //Now another loop to change the cards in the deck
        for(uint256 i = 0; i < _keysNew.length; i++) {

            //Skip if both new key and old key are same
            if(deckCards[_dkID][i] == _keysNew[i]) {
                continue;
            }

            //Check if the new key is already in the users inventory
            if(cardsBalances[_owner][_keysNew[i]] > 0) {                
                cardsBalances[_owner][_keysNew[i]]--;
            } else {
                //Add the key to the deck by take it from the user wallet, change the ownership of the card 
                _keys[_countKeys] = _keysNew[i];
                _amounts[_countKeys] = 1;
                _countKeys++;
                
            }
            //Add the key to the deck and change the ownership of the card
            deckCards[_dkID][i] = _keysNew[i];
            cardsBalances[_this][_keysNew[i]]++;

        }

        //Check the uniueness here of the card keys
        for(uint256 i = 0; i < MAX_CARDS; i++) {
            for(uint256 j = i + 1; j < MAX_CARDS; j++) {
                if(deckCards[_dkID][i] == deckCards[_dkID][j] && deckCards[_dkID][i] != 0) {
                    revert("Not Unique");
                }
            }
        }

        
        //Now take keys from the user wallet to the contract
        if(_countKeys > 0) {
            farFantasyCard.safeBatchTransferFrom(_owner, _this, _keys, _amounts, "");
        }

        //Emit the deck event
        emit Deck(1, _owner, _dkID, _keysNew);
    }

    

    //@todo testing and optimization 150355
    function _dkDelete(uint256 _dkID, address _owner, bool withdraw) internal returns (bool) {
        require(_owner == _ownerOf[_dkID], "Denied");

        //This contracts address
        address _this = address(this);

        uint256[] memory _keys = new uint256[](MAX_CARDS);
        uint256[] memory _amounts = new uint256[](MAX_CARDS);
        uint256 _countKeys = 0;


        for(uint256 i = 0; i < MAX_CARDS; i++) {

            uint256 _card = deckCards[_dkID][i];

            //If a deck have card ID 0, then it is not a valid card
            if(_card == 0) {
                continue;
            }
            if(cardsBalances[_this][_card] > 0) {
                //Reduce the balance from contract inventory
                cardsBalances[_this][_card]--;
                //Add the key to the withdraw list
                if(withdraw) {
                    _keys[_countKeys] = _card;
                    _amounts[_countKeys] = 1;
                    _countKeys++;
                }
                else {
                    //Add the key back to the inventory of user
                    cardsBalances[_owner][_card]++;
                }
                
            } 

            //Delete the card from the deck
            deckCards[_dkID][i] = 0;
        }

        //Delete the deck now
        //delete deckCards[_dkID] = [0,0,0,0,0];
    
        if(withdraw && _countKeys > 0) {
            farFantasyCard.safeBatchTransferFrom(_this, _owner, _keys, _amounts, "");
        }
        
        //Tell the world that the deck is deleted
        emit Deck(2, _owner, _dkID, _keys);

        return true;
    }


    //Deck getters 
    function getDeckFids(uint256 _deckID) public view returns(uint256[] memory) {
        uint256[] memory _fids = new uint256[](MAX_CARDS);
        uint256 _count = 0;
        for(uint256 i = 0; i < MAX_CARDS; i++) {
            if(deckCards[_deckID][i] > 0) {
                _fids[_count] = deckCards[_deckID][i];
                _count++;
            }
        }
        return _fids;
    }

    //Helper function to transfer the keys to the contract 
    //@tested
    function transferKeysIn(uint256[] calldata _keys, uint256[] calldata _amount) public {
        require(_keys.length == _amount.length, "Mismatch");
        require(_keys.length > 0, "0 keys");
        farFantasyCard.safeBatchTransferFrom(msg.sender, address(this), _keys, _amount, "");
        for(uint256 i = 0; i < _keys.length; i++) {
            cardsBalances[msg.sender][_keys[i]] += _amount[i];
        }
    }

    //Helper function to transfer the keys out of the contract
    //@tested
    function transferKeysOut(uint256[] calldata _keys, uint256[] calldata _amount) public {
        require(_keys.length == _amount.length, "Mismatch");
        require(_keys.length > 0, "0 keys");
        for(uint256 i = 0; i < _keys.length; i++) {
            require(cardsBalances[msg.sender][_keys[i]] >= _amount[i], "Not enough Cards");
            cardsBalances[msg.sender][_keys[i]] -= _amount[i];
        }
        farFantasyCard.safeBatchTransferFrom(address(this), msg.sender, _keys, _amount, "");
    }

    function onERC1155Received(address, address, uint256, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] memory, uint256[] memory, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}

contract FarfantasyDeck is ERC721 {


    constructor(address _farFantasyCard) {
        farFantasyCard = IFarFantasyCards(_farFantasyCard);
    }

    function mint(uint256[] calldata _keys) public {
        _mint(msg.sender, _keys);
    }

    function burn(uint256 id, bool withdraw) public {
        require(msg.sender == _ownerOf[id], "Denied");
        _burn(id, withdraw);
    }
}
