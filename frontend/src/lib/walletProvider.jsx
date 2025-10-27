import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { bsc, mainnet } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// Setup queryClient
const queryClient = new QueryClient();

// Get projectId from https://cloud.reown.com
const projectId = "304c2a0b251e9269a2d919c9a03b27e1"; // You should replace this with your own project ID

// Create a metadata object
const metadata = {
  name: "BFM Read",
  description: "BFM Read - Web3 Reading Platform",
  url: "https://invincible-read.com", // Update with your actual domain
  icons: ["https://assets.reown.com/reown-profile-pic.png"], // Update with your app icon
};

// Set the networks
const networks = [mainnet, bsc]; // ✅ Use BNB Smart Chain instead of Arbitrum

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false, // Set to false for client-side apps
});

// Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true,
    email: false,
    socials: false,
  },
});

export function WalletProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export { wagmiAdapter };
