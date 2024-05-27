import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const ContractABIRegistryModule = buildModule("ContractABIRegistryModule", (m) => {

  const contractABIRegistry = m.contract("SmartoGentNFT", []);

  return { contractABIRegistry };
});

export default ContractABIRegistryModule;
