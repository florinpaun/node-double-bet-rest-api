import { contract, weiToEth, ethToWei } from '../utils/utils.js';

export const fundContract = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount) {
            return res.status(400).json({ error: 'Missing amount field' });
        }
        const amountWei = ethToWei(amount);

        console.log(`Funding contract with ${amount} ETH`);

        const tx = await contract.fundContract({ value: amountWei });

        console.log(`Transaction sent: ${tx.hash}`);
        console.log('Waiting for confirmation...');

        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        console.log(`Contract funded with ${amount} ETH`);

        res.status(200).json({
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const contractBalance = async (req, res) => {
    try {
        const balanceWei = await contract.getContractBalance();
        const balanceEth = weiToEth(balanceWei);

        res.status(200).json({
            success: true,
            wei: balanceWei.toString(),
            eth: balanceEth
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}