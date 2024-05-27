import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const SmartoGentNFTModule = buildModule("SmartoGentNFTModule", (m) => {
  const oracleAddress = m.getParameter("initialOracleAddress", "0x4168668812C94a3167FCd41D12014c5498D74d7e");
  const initialPrompt = m.getParameter("initialPrompt", "Generate a visually appealing NFT image that represents concepts related to ABI, Solidity, and web3 technology. Use elements that symbolize smart contracts, decentralized applications, and blockchain technology. The design should be modern and capture the essence of the Ethereum ecosystem");

  const smartoGentNFT = m.contract("SmartoGentNFT", [oracleAddress, initialPrompt]);

  return { smartoGentNFT };
});

export default SmartoGentNFTModule;
