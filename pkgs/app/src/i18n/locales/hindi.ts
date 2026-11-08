const hindi = {
  error: {
    walletNotFound:
      "Midnight 1AM Wallet नहीं मिला। कृपया 1AM एक्सटेंशन इंस्टॉल करें।",
    versionMismatch:
      "1AM Wallet का वर्शन ({{version}}) पुराना है। कृपया इसे नवीनतम वर्शन में अपडेट करें।",
    networkMismatch:
      "नेटवर्क मेल नहीं खाता। कृपया 1AM Wallet Settings में {{network}} चुनें।",
    userRejected: "वॉलेट कनेक्शन रद्द कर दिया गया।",
    walletTimeout:
      "कनेक्शन का समय समाप्त हो गया। कृपया 1AM Wallet को अनलॉक करें और पुनः प्रयास करें।",
    walletSyncing:
      "1AM Wallet अभी नेटवर्क के साथ सिंक हो रहा है। कृपया 1AM एक्सटेंशन खोलें, सिंक पूरा होने की प्रतीक्षा करें, और फिर पुनः प्रयास करें।",
    unsupportedApi:
      "असमर्थित 1AM Wallet API: न तो enable() और न ही connect() मिला।",
    connectGeneric: "कनेक्शन के दौरान एक त्रुटि आई। कृपया पुनः प्रयास करें।",
    useWalletOutsideProvider:
      "useWallet का उपयोग WalletProvider के भीतर ही किया जाना चाहिए",
    connectFailed:
      "कनेक्शन विफल रहा। कृपया ऊपर दिए गए बटन से पुनः प्रयास करें।",
    balanceFailed: "बैलेंस प्राप्त करने में विफल",
  },
  label: {
    connected: "कनेक्टेड",
    shieldedAddress: "शील्ड किया गया पता (Shielded Address)",
    balance: "बैलेंस",
    refresh: "रिफ्रेश करें",
    disconnect: "डिस्कनेक्ट करें",
    loadingBalance: "बैलेंस लोड हो रहा है...",
    shielded: "शील्ड किया गया",
    unshielded: "अनशील्ड",
    dust: "डस्ट (Dust)",
    selectNetwork: "नेटवर्क चुनें",
  },
  aria: {
    copyAddress: "पता कॉपी करें",
    refreshBalance: "बैलेंस रिफ्रेश करें",
    midnightLogo: "Midnight",
  },
  button: {
    connect: "1AM Wallet कनेक्ट करें",
    connecting: "कनेक्ट हो रहा है...",
    disconnect: "डिस्कनेक्ट करें",
  },
  app: {
    subtitle: "Midnight Network तक पहुँचने के लिए अपना 1AM Wallet कनेक्ट करें",
  },
  toast: {
    copySuccess: "पता क्लिपबोर्ड पर कॉपी हो गया",
  },
  thermoseal: {
    title: "ThermoSeal ZK कोल्ड-चेन डैशबोर्ड",
    contractAddress: "अनुबंध का पता (Contract Address)",
    addressPlaceholder: "तैनात अनुबंध का पता दर्ज करें...",
    join: "अनुबंध लोड करें",
    joining: "कनेक्ट हो रहा है...",
    error: "त्रुटि",
    commercial: {
      tractionBadge: "लाइव प्रोडक्शन पायलट",
      activeUsersLabel: "सक्रिय लॉजिस्टिक्स पार्टनर",
      commercialReadiness: "व्यावसायिक व्यवहार्यता और वास्तविक दुनिया का ट्रैक्शन",
    },
    streams: {
      temp: "तापमान (°C)",
      humidity: "आर्द्रता (% RH)",
      shock: "शॉक / प्रभाव (g)",
    },
    commit: {
      button: "खंड प्रमाण (Chunk Proof) जमा करें",
      loading: "ZK प्रमाण जनरेट हो रहा है O(128)...",
    },
    finalize: {
      button: "लेग अनुपालन (Compliance) सुनिश्चित करें",
      loading: "लेग सत्यापन और नलिफायर की खपत हो रही है...",
    },
    waiting: {
      forChunks: "सेंसर चंक प्रमाण की प्रतीक्षा की जा रही है...",
      compliant: "लेग पूरी तरह अनुपालित है और ऑन-चेन सत्यापित है",
    },
    phase: {
      register: "पंजीकरण",
      submit: "चंक सबमिट करें",
      finalize: "लेग अंतिम रूप दें",
      verify: "सत्यापित करें",
    },
    sealed: {
      title: "रीडिंग्स ZK-सील्ड और मर्कल सत्यापित",
      zkSealed: "ZKP कमिटेड · निजी सेंसर डेटा सुरक्षित",
    },
    toast: {
      chunkOk: "सेंसर चंक सफलतापूर्वक सबमिट हो गया!",
      finalizeOk: "लेग को अंतिम रूप दे दिया गया है और नलिफायर दर्ज हो गया है!",
    },
    result: {
      compliant: "शिपमेंट पूरी तरह से अनुपालन में है 🛡️",
      violated: "अनुपालन उल्लंघन का पता चला ⚠️",
      activeLeg: "सक्रिय परिवहन लेग",
      verifyOnChain: "ऑन-चेन सत्यापित करें",
      newShipment: "नया शिपमेंट रजिस्टर करें",
    },
  },
} as const;

export default hindi;