export const simulateNetworkLatency = async () => {
  return new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (1200 - 300 + 1)) + 300),
  );
};
