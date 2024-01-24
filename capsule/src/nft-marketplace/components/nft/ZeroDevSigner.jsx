import { createCapsuleViemClient } from "@usecapsule/web-sdk"
import { useState, useMemo } from "react";
import { walletClientToSmartAccountSigner } from '@kerneljs/core';
import { createEcdsaKernelAccountClient } from '@kerneljs/presets/zerodev';
import { sepolia } from 'viem/chains'
import { http } from 'viem';

const INFURA_HOST = 'https://sepolia.infura.io/v3/961364684c7346c080994baab1469ea8';

const ZeroDevSigner = ({ capsule, loggedIn }) => {
    const [kernelAddress, setKernelAddress] = useState();

    const kernel = useMemo(async () => {
        const viemClient = createCapsuleViemClient(capsule, {
            chain: sepolia,
            transport: http(INFURA_HOST),
        })
        const smartAccountSigner = walletClientToSmartAccountSigner(viemClient)
        const kernel = await createEcdsaKernelAccountClient({
            chain: sepolia,
            projectId: 'YOUR_PROJECT_ID',
            signer: smartAccountSigner,
        });

        if (kernel?.account?.address) {
            setKernelAddress(kernel.account.address);
        }
        return kernel;
    }, [capsule.account]);

    return (
        <div>
            {loggedIn && kernel && (
                <>
                    <div>Kernel is ready</div>
                    <div>Kernel address: {kernelAddress}</div>
                </>
            )}
        </div>
    )
}

export default ZeroDevSigner;