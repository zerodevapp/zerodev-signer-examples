import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { createEcdsaKernelAccountClient } from '@zerodev/presets';
import { polygonMumbai } from 'viem/chains';
import { zeroAddress } from 'viem';
import { walletClientToSmartAccountSigner } from 'permissionless';

export default function Home() {
  const { isAuthenticated, primaryWallet } = useDynamicContext();

  const sendUserOp = async () => {
    // eslint-disable-next-line
    const dynamicWalletClient: any = await primaryWallet?.connector?.getWalletClient();

    const smartAccountSigner = await walletClientToSmartAccountSigner(
      dynamicWalletClient
    );
    const kernelClient = await createEcdsaKernelAccountClient({
      // required
      chain: polygonMumbai,
      projectId: 'YOUR_PROJECT_ID',
      signer: smartAccountSigner,
  
      // optional
      provider: "STACKUP", // defaults to a recommended provider
      index: BigInt(1), // defaults to 0
      paymaster: 'SPONSOR', // defaults to SPONSOR
    })
  
    console.log("My account:", kernelClient.account.address)
  
    const txnHash = await kernelClient.sendTransaction({
      to: zeroAddress,
      value: BigInt(0),
      data: "0x",
    })
  
    console.log("txn hash:", txnHash)
  
    const userOpHash = await kernelClient.sendUserOperation({
      userOperation: {
        callData: await kernelClient.account.encodeCallData({
          to: zeroAddress,
          value: BigInt(0),
          data: "0x",
        }),
      },
    })
  
    console.log("userOp hash:", userOpHash)
  }

  return (
    <div>
      <h1>Home</h1>
      <p>This is the home page</p>
      {isAuthenticated ? <p>Authenticated</p> : <p>Not authenticated</p>}
      {isAuthenticated && (
        <button onClick={sendUserOp}>
          Send userop
        </button>
      )}
    </div>
  )
}