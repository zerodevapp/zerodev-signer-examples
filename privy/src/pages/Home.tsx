import React, { useEffect, useState } from 'react';

import { useWallets, usePrivy } from '@privy-io/react-auth';
import { createEcdsaKernelAccountClient } from '@kerneljs/presets/zerodev';
import { useNavigate } from 'react-router-dom';
import { providerToSmartAccountSigner, KernelAccountClient } from '@kerneljs/core';
import { polygonMumbai } from 'viem/chains';
import { ZERODEV_PROJECT_IDS } from '../constants';
import { bundlerActions } from "permissionless";

type KernelClientType =  Awaited<ReturnType<typeof createEcdsaKernelAccountClient>>;

function App() {
  const [kernelClient, setKernelClient] = useState<KernelClientType | undefined>();
  const navigate = useNavigate()
  const { ready, authenticated, user, logout } =
    usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  useEffect(() => {
    const getKernelClient = async () => {
      if (!embeddedWallet) return;
      const privyProvider = await embeddedWallet.getEthereumProvider();
  
      // // Use the Provider from Privy to create a SmartAccountSigner
      const signer = await providerToSmartAccountSigner(privyProvider);
  
      // Set up your Kernel client
      const kernelClient = await createEcdsaKernelAccountClient({
        chain: polygonMumbai,
        projectId: ZERODEV_PROJECT_IDS[0],
        signer,
      });
      console.log(`Kernel Address: ${kernelClient.account.address}`);
      setKernelClient(kernelClient);
    }
    if (!kernelClient) {
      getKernelClient();
    }
  }, [embeddedWallet]);

  const sendUserOp = async () => {
    if (!kernelClient) return;
    console.log('sending user op')

    const userOpHash = await kernelClient.sendUserOperation({
      userOperation: {
          callData: await kernelClient.account.encodeCallData({
            to: "0x517CF7C9606B30a1b4723f2E40780033dBDD36e5",
            value: BigInt(0),
            data: "0x",
          }),
      },
    });
    console.log('userOpHash: ', userOpHash);

    const bundlerClient = kernelClient.extend(bundlerActions)
    const receipt = await bundlerClient.waitForUserOperationReceipt({ hash: userOpHash });
    console.log('receipt: ', receipt);
  }

  const eoa =
    wallets.find((wallet) => wallet.walletClientType === "privy") || wallets[0];

  useEffect(() => {
    if (ready && !authenticated) {
      navigate("/login");
    }
  }, [ready, authenticated, navigate]);

  return (
    <div className="App">
      <div>
        Authenticated: {authenticated.toString()}
        <br />
        {authenticated && <button onClick={() => logout()}>logout</button>}
      </div>
      {ready && authenticated && (
        <div>
          <p>
            Your Smart Wallet Address: {kernelClient?.account?.address}
          </p>
          <p>
            Your signer address: {eoa?.address} 
          </p>
        </div>
      )}
      <button onClick={sendUserOp}>Send User Op</button>
    </div>
  );
}

export default App;
