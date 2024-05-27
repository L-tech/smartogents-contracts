// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract ContractABIRegistry {
    struct ABIRecord {
        uint64 id;
        string contractName;
        string ipfsHash;
    }

    mapping(address => ABIRecord) private abiRecords;
    address[] private contractAddresses;
    address private owner;
    uint64 private abiCount = 1;

    error ABINOTFOUND();

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addABIRecord(
        string calldata _contractName,
        string calldata _ipfsHash,
        address _contractAddress
    ) external {
        require(bytes(_contractName).length > 0, "Contract name cannot be empty.");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty.");
        require(_contractAddress != address(0), "Contract address cannot be zero.");
        require(abiRecords[_contractAddress].id == 0, "ABI record already exists for the given contract address.");

        abiRecords[_contractAddress] = ABIRecord(abiCount, _contractName, _ipfsHash);
        contractAddresses.push(_contractAddress);
        abiCount++;
    }

    function deleteABIRecord(address _contractAddress) external onlyOwner {
        if (abiRecords[_contractAddress].id == 0) {
            revert ABINOTFOUND();
        }

        delete abiRecords[_contractAddress];
        for (uint256 i = 0; i < contractAddresses.length; i++) {
            if (contractAddresses[i] == _contractAddress) {
                contractAddresses[i] = contractAddresses[contractAddresses.length - 1];
                contractAddresses.pop();
                break;
            }
        }
    }

    function getABIRecord(address _contractAddress) external view returns (string memory contractName, string memory ipfsHash) {
        if (abiRecords[_contractAddress].id == 0) {
            revert ABINOTFOUND();
        }
        ABIRecord memory record = abiRecords[_contractAddress];
        return (record.contractName, record.ipfsHash);
    }

    function getAllABIRecords() external view returns (address[] memory addresses, string[] memory contractNames, string[] memory ipfsHashes) {
        uint256 count = contractAddresses.length;
        addresses = new address[](count);
        contractNames = new string[](count);
        ipfsHashes = new string[](count);

        for (uint256 i = 0; i < count; i++) {
            address addr = contractAddresses[i];
            ABIRecord memory record = abiRecords[addr];
            addresses[i] = addr;
            contractNames[i] = record.contractName;
            ipfsHashes[i] = record.ipfsHash;
        }

        return (addresses, contractNames, ipfsHashes);
    }
}
