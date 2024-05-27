// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "./interfaces/IOracle.sol";
import "./interfaces/IContractABIRegistry.sol";
contract SmartoGentScriptGenerator {

    struct Message {
        string role;
        string content;
    }

    struct ScriptGenerator {
        address owner;
        Message[] messages;
        uint messagesCount;
    }

    mapping(uint => ScriptGenerator) public scriptGeneratorRuns;
    uint private scriptGeneratorRunsCount;

    event scriptGeneratorCreated(address indexed owner, uint indexed requestId);
    address private owner;
    address public oracleAddress;
    address public abiContractAddress;

    event OracleAddressUpdated(address indexed newOracleAddress);
    event ABIContractAddressUpdated(address indexed newAbiContractAddress);

    IOracle.OpenAiRequest private config;

    constructor(address initialOracleAddress, address _abiContract) {
        owner = msg.sender;
        oracleAddress = initialOracleAddress;
        abiContractAddress = _abiContract;
        scriptGeneratorRunsCount = 0;
        config = IOracle.OpenAiRequest({
        model : "gpt-4o",
        frequencyPenalty : 21, // > 20 for null
        logitBias : "", // empty str for null
        maxTokens : 1000, // 0 for null
        presencePenalty : 21, // > 20 for null
        responseFormat : "{\"type\":\"text\"}",
        seed : 0, // null
        stop : "", // null
        temperature : 10, // Example temperature (scaled up, 10 means 1.0), > 20 means null
        topP : 101, // Percentage 0-100, > 100 means null
        tools : "[{\"type\":\"function\",\"function\":{\"name\":\"web_search\",\"description\":\"Search the internet\",\"parameters\":{\"type\":\"object\",\"properties\":{\"query\":{\"type\":\"string\",\"description\":\"Search query\"}},\"required\":[\"query\"]}}},{\"type\":\"function\",\"function\":{\"name\":\"code_interpreter\",\"description\":\"Evaluates python code in a sandbox environment. The environment resets on every execution. You must send the whole script every time and print your outputs. Script should be pure python code that can be evaluated. It should be in python format NOT markdown. The code should NOT be wrapped in backticks. All python packages including requests, matplotlib, scipy, numpy, pandas, etc are available. Output can only be read from stdout, and stdin. Do not use things like plot.show() as it will not work. print() any output and results so you can capture the output.\",\"parameters\":{\"type\":\"object\",\"properties\":{\"code\":{\"type\":\"string\",\"description\":\"The pure python script to be evaluated. The contents will be in main.py. It should not be in markdown format.\"}},\"required\":[\"code\"]}}}]",
        toolChoice : "auto", // "none" or "auto"
        user : "" // null
        });
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

    function initiateScripGenerator(string memory message, address _contractAddress) public returns (uint i) {
        (, string memory knowledgeBase) = IContractABIRegistry(abiContractAddress).getABIRecord(_contractAddress);
        ScriptGenerator storage run = scriptGeneratorRuns[scriptGeneratorRunsCount];

        run.owner = msg.sender;
        Message memory newMessage;
        newMessage.content = message;
        newMessage.role = "user";
        run.messages.push(newMessage);
        run.messagesCount = 1;

        uint currentId = scriptGeneratorRunsCount;
        scriptGeneratorRunsCount = scriptGeneratorRunsCount + 1;

        // IOracle(oracleAddress).createOpenAiLlmCall(currentId, config);
        IOracle(oracleAddress).createKnowledgeBaseQuery(
            currentId,
            knowledgeBase,
            message,
            1
        );
        emit scriptGeneratorCreated(msg.sender, currentId);

        return currentId;
    }

    function onOracleKnowledgeBaseQueryResponse(
        uint runId,
        string [] memory documents,
        string memory /*errorMessage*/
    ) public onlyOracle {
        ScriptGenerator storage run = scriptGeneratorRuns[scriptGeneratorRunsCount];
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
        IOracle(oracleAddress).createOpenAiLlmCall(runId, config);
    }

    function onOracleOpenAiLlmResponse(
        uint runId,
        IOracle.OpenAiResponse memory response,
        string memory errorMessage
    ) public onlyOracle {
        ScriptGenerator storage run = scriptGeneratorRuns[runId];
        require(
            keccak256(abi.encodePacked(run.messages[run.messagesCount - 1].role)) == keccak256(abi.encodePacked("user")),
            "No message to respond to"
        );

        if (!compareStrings(errorMessage, "")) {
            Message memory newMessage;
            newMessage.role = "assistant";
            newMessage.content = errorMessage;
            run.messages.push(newMessage);
            run.messagesCount++;
        } else {
            if (compareStrings(response.content, "")) {
                IOracle(oracleAddress).createFunctionCall(runId, response.functionName, response.functionArguments);
            } else {
                Message memory newMessage;
                newMessage.role = "assistant";
                newMessage.content = response.content;
                run.messages.push(newMessage);
                run.messagesCount++;
            }
        }
    }

    function onOracleFunctionResponse(
        uint runId,
        string memory response,
        string memory errorMessage
    ) public onlyOracle {
        ScriptGenerator storage run = scriptGeneratorRuns[runId];
        require(
            compareStrings(run.messages[run.messagesCount - 1].role, "user"),
            "No function to respond to"
        );
        if (compareStrings(errorMessage, "")) {
            Message memory newMessage;
            newMessage.role = "user";
            newMessage.content = response;
            run.messages.push(newMessage);
            run.messagesCount++;
            IOracle(oracleAddress).createOpenAiLlmCall(runId, config);
        }
    }

    function addMessage(string memory message, uint runId) public {
        ScriptGenerator storage run = scriptGeneratorRuns[runId];
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

        IOracle(oracleAddress).createOpenAiLlmCall(runId, config);
    }

    function getMessageHistoryContents(uint requestId) public view returns (string[] memory) {
        string[] memory messages = new string[](scriptGeneratorRuns[requestId].messages.length);
        for (uint i = 0; i < scriptGeneratorRuns[requestId].messages.length; i++) {
            messages[i] = scriptGeneratorRuns[requestId].messages[i].content;
        }
        return messages;
    }

    function getMessageHistoryRoles(uint requestId) public view returns (string[] memory) {
        string[] memory roles = new string[](scriptGeneratorRuns[requestId].messages.length);
        for (uint i = 0; i < scriptGeneratorRuns[requestId].messages.length; i++) {
            roles[i] = scriptGeneratorRuns[requestId].messages[i].role;
        }
        return roles;
    }

    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}
