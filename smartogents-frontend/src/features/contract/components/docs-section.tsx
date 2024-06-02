import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractCardProps } from "@/features/contracts/components/contract-card";
import {
  useContractWrite,
  useContract,
  useContractRead,
  useAddress,
  useMetamask,
} from "@thirdweb-dev/react";
import ABI from "@/constants/SmartoGentOverview.json";
import { ethers } from "ethers";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { Loader2 } from "lucide-react";

interface Message {
  role: string;
  content: string;
}

export const DocsSection = ({
  address,
  contractName,
  ipfsHash,
}: ContractCardProps) => {
  const connectWithMetamask = useMetamask();
  const userAddress = useAddress();
  const message =
    "Generate comprehensive documentation for the following smart contract based on its ABI. Use the standard documentation format including sections for Overview, Functions, Events, State Variables, Modifiers, and Constructor";
  const { data: contract } = useContract(
    "0xB52329A11333462D192110357Be2da470B79B13e",
    ABI
  );
  const {
    mutateAsync: generateScript,
    isLoading: isGenerating,
    error: generateError,
  } = useContractWrite(contract, "initiateRequest");

  const [chatId, setChatId] = useState<number | undefined>(undefined);

  const {
    data: messageContents,
    isLoading: isLoadingContents,
    error: contentsError,
  } = useContractRead(contract, "getMessageHistoryContents", [
    chatId !== undefined ? [chatId] : undefined,
  ]);

  const {
    data: messageRoles,
    isLoading: isLoadingRoles,
    error: rolesError,
  } = useContractRead(contract, "getMessageHistoryRoles", [
    chatId !== undefined ? [chatId] : undefined,
  ]);

  const [messages, setMessages] = useState<Message[]>([]);

  const getChatId = (receipt: any, iface: ethers.utils.Interface) => {
    let chatId;
    for (const log of receipt.logs) {
      try {
        const parsedLog = iface.parseLog(log);
        console.log("Parsed Log:", parsedLog);
        if (parsedLog && parsedLog.name === "RequestCreated") {
          chatId = ethers.BigNumber.from(parsedLog.args[1]).toNumber();
        }
      } catch (error) {
        console.log("Could not parse log:", log);
        console.error("Parsing error:", error);
      }
    }
    return chatId;
  };

  useEffect(() => {
    if (messageContents && messageRoles) {
      const fetchedMessages: Message[] = messageContents.map(
        (content: string, index: number) => ({
          role: messageRoles[index],
          content,
        })
      );
      setMessages(fetchedMessages);
      console.log(fetchedMessages);
    }
  }, [messageContents, messageRoles]);

  const handleGenerate = async () => {
    if (!userAddress) {
      await connectWithMetamask();
    }
    await generateScript({
      args: [message, address],
    }).then((res: any) => {
      console.log("Transaction receipt logs:", res.receipt.logs);
      const receipt = res.receipt;
      const iface = new ethers.utils.Interface(ABI);
      const chatId = getChatId(receipt, iface);
      console.log("Generated chat ID:", chatId);

      if (chatId !== undefined) {
        setChatId(chatId);
      }
    });
  };
  return (
    <Card className="glassmorphism mt-3 w-full">
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle className="orange_gradient">
            Docs for {contractName}
          </CardTitle>
          <Button
            className="blue_gradient"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            Generate
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isGenerating || isLoadingContents ? (
          <div className="flex w-full flex-col items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin" />
            <p>Loading Content...</p>
          </div>
        ) : (
          messages.length !== 0 &&
          messages.map(
            (message, index) =>
              message.role === "assistant" && (
                <MarkdownRenderer content={message.content} key={index} />
              )
          )
        )}
      </CardContent>
    </Card>
  );
};
