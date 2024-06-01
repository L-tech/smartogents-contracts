import {Contract, ethers, TransactionReceipt, Wallet} from "ethers";
import ABI from "../abis/ContractABIRegistry.json";
import * as readline from 'readline';

require("dotenv").config();

async function main() {

  const rpcUrl = process.env.RPC_URL
  if (!rpcUrl) throw Error("Missing RPC_URL in .env")
  const privateKey = process.env.PRIVATE_KEY_GALADRIEL
  if (!privateKey) throw Error("Missing PRIVATE_KEY in .env")
  const contractAddress = process.env.CONTRACT_ABI_REGISTRY
  if (!contractAddress) throw Error("Missing ABI_CONTRACT_ADDRESS in .env")

  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const wallet = new Wallet(
    privateKey, provider
  )
  const contract = new Contract(contractAddress, ABI, wallet)

  // Call the startChat function
  const contractName = "ContractABIRegistry";
  const ipfsHash = "QmS2bVjM6ypnK19uxdNS2q8ZJh284JTKpEhqPtW8TemaqL";
  const contractABIAddress = "0xd74C08f8ffDF88C807367813Ad64a960618f4dcC";

  // const transactionResponse = await contract.addABIRecord(contractName, ipfsHash, contractABIAddress);
  // const receipt = await transactionResponse.wait()
  // console.log(`Message sent, tx hash: ${receipt.hash}`)

  // const transactionResponse = await contract.deleteABIRecord(contractABIAddress);
  // const receipt = await transactionResponse.wait()
  // console.log(`Message sent, tx hash: ${receipt.hash}`)

  // const transactionResponse = await contract.getAllABIRecords();
  // const [addresses, contractNames, ipfsHashes] = transactionResponse;
  // console.log(transactionResponse);
  const transactionResponse = await contract.getABIRecord(contractABIAddress);
  console.log(transactionResponse);

  // // Create an array of objects to structure the data
  // const abiRecords = addresses.map((address: string, index: number) => ({
  //   address,
  //   contractName: contractNames[index],
  //   ipfsHash: ipfsHashes[index]
  // }));

// Log the structured data
// console.log(abiRecords);

}

async function getAllABIRecords() {
  const rpcUrl = process.env.RPC_URL
  if (!rpcUrl) throw Error("Missing RPC_URL in .env")
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw Error("Missing PRIVATE_KEY in .env")
  const contractAddress = process.env.CONTRACT_ABI_REGISTRY
  if (!contractAddress) throw Error("Missing ABI_CONTRACT_ADDRESS in .env")

  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const wallet = new Wallet(
    privateKey, provider
  )
  const contract = new Contract(contractAddress, ABI, wallet)


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });