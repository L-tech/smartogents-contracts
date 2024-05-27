// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "./interfaces/IOracle.sol";
import "./interfaces/IContractABIRegistry.sol";

contract SmartoGentOverview {

    struct Message {
        string role;
        string content;
    }

    struct RequestRun {
        address owner;
        Message[] messages;
        uint messagesCount;
    }

    mapping(uint => RequestRun) public requestRuns;
    uint private requestRunsCount;

    event RequestCreated(address indexed owner, uint indexed requestId);

    address private owner;
    address public oracleAddress;
    address public abiContractAddress;

    event OracleAddressUpdated(address indexed newOracleAddress);
    event ABIContractAddressUpdated(address indexed newAbiContractAddress);

    error EMPTYKNOWLEDGEBASE();

    constructor(address initialOracleAddress, address _abiContract) {
        owner = msg.sender;
        oracleAddress = initialOracleAddress;
        abiContractAddress = _abiContract;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Caller is not oracle");
        _;
    }

    function setOracleAddress(address newOracleAddress) public onlyOwner {
        oracleAddress = newOracleAddress;
        emit OracleAddressUpdated(newOracleAddress);
    }
    function setABIContractAddress(address newAbiContractAddress) public onlyOwner {
        abiContractAddress = newAbiContractAddress;
        emit ABIContractAddressUpdated(newAbiContractAddress);
    }

    function initiateRequest(string memory message, address _contractAddress) public returns (uint i) {
        (, string memory knowledgeBase) = IContractABIRegistry(abiContractAddress).getABIRecord(_contractAddress);
        RequestRun storage run = requestRuns[requestRunsCount];

        run.owner = msg.sender;
        Message memory newMessage;
        newMessage.content = message;
        newMessage.role = "user";
        run.messages.push(newMessage);
        run.messagesCount = 1;

        uint currentId = requestRunsCount;
        requestRunsCount = requestRunsCount + 1;

        
        IOracle(oracleAddress).createKnowledgeBaseQuery(
            currentId,
            knowledgeBase,
            message,
            1
        );
        emit RequestCreated(msg.sender, currentId);

        return currentId;
    }

    function onOracleLlmResponse(
        uint runId,
        string memory response,
        string memory /*errorMessage*/
    ) public onlyOracle {
        RequestRun storage run = requestRuns[runId];
        require(
            keccak256(abi.encodePacked(run.messages[run.messagesCount - 1].role)) == keccak256(abi.encodePacked("user")),
            "No message to respond to"
        );

        Message memory newMessage;
        newMessage.content = response;
        newMessage.role = "assistant";
        run.messages.push(newMessage);
        run.messagesCount++;
    }

    function onOracleKnowledgeBaseQueryResponse(
        uint runId,
        string [] memory documents,
        string memory /*errorMessage*/
    ) public onlyOracle {
        RequestRun storage run = requestRuns[runId];
        require(
            keccak256(abi.encodePacked(run.messages[run.messagesCount - 1].role)) == keccak256(abi.encodePacked("user")),
            "No message to add context to"
        );
        // Retrieve the last user message
        Message storage lastMessage = run.messages[run.messagesCount - 1];

        // Start with the original message content
        string memory newContent = lastMessage.content;

        // Append "Relevant context:\n" only if there are documents
        if (documents.length > 0) {
            newContent = string(abi.encodePacked(newContent, "\n\nRelevant context:\n"));
        }

        // Iterate through the documents and append each to the newContent
        for (uint i = 0; i < documents.length; i++) {
            newContent = string(abi.encodePacked(newContent, documents[i], "\n"));
        }

        // Finally, set the lastMessage content to the newly constructed string
        lastMessage.content = newContent;

        // Call LLM
        IOracle(oracleAddress).createLlmCall(runId);
    }

    function askQuestion(string memory message, uint runId, address _contractAddress) public {
        (, string memory knowledgeBase) = IContractABIRegistry(abiContractAddress).getABIRecord(_contractAddress);
        RequestRun storage run = requestRuns[runId];
        require(
            keccak256(abi.encodePacked(run.messages[run.messagesCount - 1].role)) == keccak256(abi.encodePacked("assistant")),
            "No response to previous message"
        );
        require(
            run.owner == msg.sender, "Only initiator of request can add messages"
        );

        Message memory newMessage;
        newMessage.content = message;
        newMessage.role = "user";
        run.messages.push(newMessage);
        run.messagesCount++;
        
        IOracle(oracleAddress).createKnowledgeBaseQuery(
            runId,
            knowledgeBase,
            message,
            3
        );
    }

    function getMessageHistoryContents(uint requestId) public view returns (string[] memory) {
        string[] memory messages = new string[](requestRuns[requestId].messages.length);
        for (uint i = 0; i < requestRuns[requestId].messages.length; i++) {
            messages[i] = requestRuns[requestId].messages[i].content;
        }
        return messages;
    }

    function getMessageHistoryRoles(uint requestId) public view returns (string[] memory) {
        string[] memory roles = new string[](requestRuns[requestId].messages.length);
        for (uint i = 0; i < requestRuns[requestId].messages.length; i++) {
            roles[i] = requestRuns[requestId].messages[i].role;
        }
        return roles;
    }
}
