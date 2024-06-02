import { ContractCard, ContractCardProps } from "./contract-card";
import { useContractRead, useContract } from "@thirdweb-dev/react";
import ABI from "@/constants/ContractABIRegistry.json";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export const ContractList = () => {
  const { data: contract } = useContract(
    "0xd74C08f8ffDF88C807367813Ad64a960618f4dcC",
    ABI
  );
  const { data, isLoading, error } = useContractRead(
    contract,
    "getAllABIRecords",
    []
  );

  const [formattedABIs, setFormattedABIs] = useState<ContractCardProps[]>([]);

  useEffect(() => {
    if (data) {
      const [addresses, contractNames, ipfsHashes] = data;
      const combinedData = addresses.map((address: string, index: number) => ({
        address,
        contractName: contractNames[index],
        ipfsHash: ipfsHashes[index],
      }));
      setFormattedABIs(combinedData);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-2 items-center">
        <Loader2 className="w-7 h-7 animate-spin" />
        <p className="text-muted-foreground">Fetching ABIS</p>
      </div>
    );
  }

  if (error) {
    return <div>Error</div>;
  }

  return (
    <div className="contract_layout">
      {formattedABIs.map((abi) => (
        <ContractCard
          key={abi.address}
          address={abi.address}
          ipfsHash={abi.ipfsHash}
          contractName={abi.contractName}
        />
      ))}
    </div>
  );
};
