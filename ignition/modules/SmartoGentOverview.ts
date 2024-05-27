import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const SmartoGentOverviewModule = buildModule("SmartoGentOverviewModule", (m) => {
  const oracleAddress = m.getParameter("initialOracleAddress", "0x4168668812C94a3167FCd41D12014c5498D74d7e");
  const abiContractAddress = m.getParameter("abiContractAddress", "0xd74C08f8ffDF88C807367813Ad64a960618f4dcC");

  const smartoGentOverview = m.contract("SmartoGentOverview", [oracleAddress, abiContractAddress]);

  return { smartoGentOverview };
});

export default SmartoGentOverviewModule;
