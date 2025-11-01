"use client";

import { WagmiProvider } from "wagmi";
import { getDefaultConfig, RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { flowTestnet } from "@/lib/wallet";
import { ReactNode, useState } from "react";
import { ThemeProvider } from "next-themes";
import "@rainbow-me/rainbowkit/styles.css";

export function Providers({ children }: { children: ReactNode }) {
    const [client] = useState(() => new QueryClient());
    const config = getDefaultConfig({
        appName: "VulnFlow",
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
        chains: [flowTestnet],
        ssr: true,
    });

    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <WagmiProvider config={config} reconnectOnMount={true}>
                <QueryClientProvider client={client}>
                    <RainbowKitProvider
                        theme={lightTheme()}
                        appInfo={{
                            appName: "VulnFlow",
                        }}
                    >
                        {children}
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </ThemeProvider>
    );
}
