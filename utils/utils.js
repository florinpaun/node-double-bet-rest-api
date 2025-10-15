import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

console.log("==============================================");
console.log('------------- Environment Variables -----');
console.log("==============================================");
console.log('RPC_URL:', process.env.RPC_URL);
console.log('ADDRESS_OWNER:', process.env.ADDRESS_OWNER);
console.log('CONTRACT_ADDRESS:', process.env.CONTRACT_ADDRESS);
console.log("==============================================");

export const contractAbi = JSON.parse(fs.readFileSync('./artifacts/abi.json', 'utf8'));
export const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
export const wallet = new ethers.Wallet(process.env.ADDRESS_OWNER_PRIVATE_KEY, provider);
export const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractAbi, wallet);
export const walletBettor = new ethers.Wallet(process.env.ADDRESS_BETTOR_PRIVATE_KEY, provider);
export const contractWithBettor = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractAbi, walletBettor);

export const ethToWei = (eth) => {
    return ethers.parseEther(eth.toString());
}
export const weiToEth = (wei) => {
    return ethers.formatEther(wei);
}

export const createOfflineAddGameTX = async (name, description, outcomes, closingTime) => {

    if (outcomes.length < 2) {
        throw new Error("Minimum 2 outcomes required");
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (closingTime <= currentTime) {
        throw new Error("Closing time must be in the future");
    }

    const iface = new ethers.Interface(contractAbi);
    const data = iface.encodeFunctionData("addGame", [
        name,
        description,
        outcomes,
        closingTime
    ]);

    // Estimate gas limit
    const gasLimit = await provider.estimateGas({
        to: process.env.CONTRACT_ADDRESS,
        from: wallet.address,
        data: data
    });

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    // Create the transaction object
    const tx = {
        to: process.env.CONTRACT_ADDRESS,
        data: data,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        nonce: await provider.getTransactionCount(wallet.address),
        chainId: (await provider.getNetwork()).chainId
    };

    console.log("Transaction object created:", {
        to: tx.to,
        nonce: tx.nonce,
        gasLimit: tx.gasLimit.toString()
    });

    const signedTransaction = await wallet.signTransaction(tx);
    console.log("Transaction signed successfully!");
    return signedTransaction;
}

export const broadcastTransaction = async (signedTx) => {
    try {
        const txResponse = await provider.broadcastTransaction(signedTx);
        console.log("Transaction broadcasted:", txResponse.hash);
        const receipt = await txResponse.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        return {
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        };
    } catch (error) {
        console.error("Error broadcasting transaction:", error.message);
        throw error;
    }
}

export const getChainId = async () => {
    const network = await provider.getNetwork();
    return network.chainId;
};
