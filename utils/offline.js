import { ethers } from "ethers";

export const createOfflineAddGameTX = async (name, description, outcomes, closingTime) => {
    // Load environment variables
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.ADDRESS_OWNER_PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
        throw new Error("Missing required environment variables");
    }

    // Load contract ABI
    const fs = await import('fs');
    const contractAbi = JSON.parse(fs.readFileSync('./artifacts/abi.json', 'utf8'));

    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Initialize contract instance
    const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

    // Validate inputs
    if (outcomes.length < 2) {
        throw new Error("Minimum 2 outcomes required");
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (closingTime <= currentTime) {
        throw new Error("Closing time must be in the future");
    }

    // Create transaction data
    const txData = await contract.populateTransaction.addGame(name, description, outcomes, closingTime);

    // Estimate gas limit
    const gasLimit = await provider.estimateGas({
        to: contractAddress,
        from: wallet.address,
        data: txData.data
    });

    // Get current gas price
    const gasPrice = await provider.getGasPrice();

    // Create the transaction object
    const tx = {
        to: contractAddress,
        data: txData.data,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        nonce: await provider.getTransactionCount(wallet.address)
    };
    return tx;
}

// Example usage
// (async () => {
//     try {
//         const name = "Handball League Final 2025";
//         const description = "Bet on the winner of the Handball League Final";
//         const outcomes = ["Team X", "Team Y", "X Draw"];
//         const closingTime = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days from now

//         const tx = await createOfflineAddGameTX(name, description, outcomes, closingTime);
//         console.log("Offline Transaction:", tx);
//     } catch (error) {
//         console.error("Error:", error);
//     }
// })();

// Export the function for external use
export default createOfflineAddGameTX;