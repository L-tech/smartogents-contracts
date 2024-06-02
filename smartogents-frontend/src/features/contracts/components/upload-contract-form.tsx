import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  useContractWrite,
  useContract,
  useAddress,
  useMetamask,
} from "@thirdweb-dev/react";
import { ethers } from "ethers";

import RegisteryABI from "@/constants/ContractABIRegistry.json";
import MintingABI from "@/constants/SmartoGentNFT.json";

const formSchema = z.object({
  contractName: z.string().min(2, {
    message: "Contract name required",
  }),
  contractABIAddress: z.string().min(2, {
    message: "Contract address required",
  }),
  ipfsHash: z.string().min(2, {
    message: "ipfsHash required",
  }),
});

export const UploadContractForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractName: "",
      contractABIAddress: "",
      ipfsHash: "",
    },
  });

  const registerContractAddress = "0xd74C08f8ffDF88C807367813Ad64a960618f4dcC";
  const mintingContractAddress = "0x032666197A5d9329e717800FC90E8C951bA12290";

  const { contract: registerContract } = useContract(
    registerContractAddress,
    RegisteryABI
  );
  const { contract: mintingContract } = useContract(
    mintingContractAddress,
    MintingABI
  );

  const { mutateAsync: registerABI, isLoading: isUploading } = useContractWrite(
    registerContract,
    "addABIRecord"
  );
  const { mutateAsync: mintNFT, isLoading: isMinting } = useContractWrite(
    mintingContract,
    "initializeMint"
  );

  const address = useAddress();
  const connectWithMetamask = useMetamask();

  const [chatId, setChatId] = useState<number | null>(null);

  const getChatId = (receipt: any, iface: ethers.utils.Interface) => {
    let chatId;
    for (const log of receipt.logs) {
      try {
        const parsedLog = iface.parseLog(log);
        console.log("Parsed Log:", parsedLog);
        if (parsedLog && parsedLog.name === "MintInputCreated") {
          chatId = ethers.BigNumber.from(parsedLog.args[1]).toNumber();
        }
      } catch (error) {
        console.log("Could not parse log:", log);
        console.error("Parsing error:", error);
      }
    }
    return chatId;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!address) {
      await connectWithMetamask();
    }
    await registerABI({
      args: [values.contractName, values.ipfsHash, values.contractABIAddress],
    }).then(async (res) => {
      console.log("ABI Registered:", res);
      await mintNFT({
        args: ["A image of a contract abi and web 3 technologies"],
      }).then((res: any) => {
        console.log("Transaction receipt logs:", res.receipt.logs);
        const receipt = res.receipt;
        const iface = new ethers.utils.Interface(MintingABI);
        const chatId = getChatId(receipt, iface);
        console.log("Generated chat ID:", chatId);
        console.log("NFT Minted:", chatId);
        setChatId(chatId);
      });
    });
  };

  return (
    <section className="w-full max-w-full flex-start flex-col">
      <h1 className="head_text text-left">
        <span className="orange_gradient bg-clip">Upload Contract</span>
      </h1>
      <p className="desc  text-left max-w-md">Upload your contract here!</p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-10 w-full max-w-2xl flex flex-col gap-7 glassmorphism"
        >
          <FormField
            control={form.control}
            name="contractName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Name</FormLabel>
                <FormControl>
                  <Input placeholder="ContractABIRegistry" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contractABIAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Address</FormLabel>
                <FormControl>
                  <Input placeholder="0xd74C08f8ffDF88C8..." {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ipfsHash"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ipfsHash</FormLabel>
                <FormControl>
                  <Input placeholder="0xd74C08f8ffDF88C8..." {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="blue_gradient"
            disabled={isMinting || isUploading}
          >
            Submit
          </Button>
        </form>
      </Form>

      {chatId !== null && (
        <div className="mt-10 w-full max-w-2xl flex flex-col gap-7">
          <h2 className="text-green-500">
            Congratulations! You've minted SmartoGentNFT Number - {chatId}
          </h2>
          <a
            href={`https://explorer.galadriel.com/token/${mintingContractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            Link to NFT Contract
          </a>
        </div>
      )}
    </section>
  );
};
