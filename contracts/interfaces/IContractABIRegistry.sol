// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface IContractABIRegistry {
    struct ABIRecord {
        uint64 id;
        string contractName;
        string ipfsHash;
    }

    error ABINOTFOUND();

    function addABIRecord(
        string calldata _contractName,
        string calldata _ipfsHash,
        address _contractAddress
    ) external;

    function deleteABIRecord(address _contractAddress) external;

    function getABIRecord(address _contractAddress) external view returns (string memory contractName, string memory ipfsHash);

    function getAllABIRecords() external view returns (
        address[] memory addresses,
        string[] memory contractNames,
        string[] memory ipfsHashes
    );
}
