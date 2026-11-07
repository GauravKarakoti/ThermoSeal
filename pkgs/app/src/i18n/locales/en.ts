const en = {
  error: {
    walletNotFound:
      "Midnight 1AM Wallet not found. Please install the extension from 1am.xyz/install-beta.",
    versionMismatch:
      "1AM Wallet version ({{version}}) is outdated. Please update to the latest version.",
    networkMismatch:
      "Network mismatch. Please select {{network}} in 1AM Wallet Settings.",
    userRejected: "Wallet connection was cancelled.",
    walletTimeout:
      "Connection timed out. Please unlock 1AM Wallet and try again.",
    walletSyncing:
      "1AM Wallet is still syncing with the network. Please open the 1AM extension, wait for sync to finish, then try again.",
    unsupportedApi:
      "Unsupported 1AM Wallet API: neither enable() nor connect() found.",
    connectGeneric: "An error occurred during connection. Please try again.",
    useWalletOutsideProvider: "useWallet must be used inside WalletProvider",
    connectFailed: "Connection failed. Please retry with the button above.",
    balanceFailed: "Failed to retrieve balance",
  },
  label: {
    connected: "Connected",
    shieldedAddress: "Shielded Address",
    balance: "Balance",
    refresh: "Refresh",
    disconnect: "Disconnect",
    loadingBalance: "Fetching balance...",
    shielded: "Shielded",
    unshielded: "Unshielded",
    dust: "Dust",
    selectNetwork: "Select Network",
  },
  aria: {
    copyAddress: "Copy address",
    refreshBalance: "Refresh balance",
    midnightLogo: "Midnight",
  },
  button: {
    connect: "Connect 1AM Wallet",
    connecting: "Connecting...",
    disconnect: "Disconnect",
  },
  app: {
    subtitle: "Connect your 1AM Wallet to access Midnight Network",
  },
  toast: {
    copySuccess: "Address copied to clipboard",
  },
  thermoseal: {
    title: "ThermoSeal ZK Cold-Chain Dashboard",
    contractAddress: "Contract Address",
    addressPlaceholder: "Enter deployed contract address...",
    join: "Load Contract",
    joining: "Connecting...",
    error: "Error",
    streams: {
      temp: "Temperature (°C)",
      humidity: "Humidity (% RH)",
      shock: "Shock / Impact (g)",
    },
    commit: {
      button: "Submit Chunk Proof",
      loading: "Generating ZK Proof O(128)...",
    },
    finalize: {
      button: "Finalize Leg Compliance",
      loading: "Verifying Leg & Nullifier...",
    },
    waiting: {
      forChunks: "Awaiting telemetry chunk proofs...",
      compliant: "Leg fully compliant and verified on-chain",
    },
    phase: {
      register: "Register",
      submit: "Submit Chunks",
      finalize: "Finalize Leg",
      verify: "Verify",
    },
    sealed: {
      title: "Readings ZK-Sealed & Merkle Verified",
      zkSealed: "ZKP committed · private sensor data intact",
    },
    toast: {
      chunkOk: "Sensor chunk submitted successfully!",
      finalizeOk: "Leg finalized and nullifier recorded!",
    },
    result: {
      compliant: "Shipment Fully Compliant 🛡️",
      violated: "Compliance Violation Detected ⚠️",
      activeLeg: "Active Transport Leg",
      verifyOnChain: "Verify On-Chain",
      newShipment: "Register New Shipment",
    },
  },
} as const;

export default en;