const assert = require("assert");
const { tryProviders, tryProvidersFast } = require("../dataProviders/fallback");

const meta = { symbol: "SZ159740" };
const zeroQuote = {
  providerName: "zero-provider",
  async quote() {
    return { price: 0, preClose: 0.601, open: 0, high: 0, low: 0 };
  }
};
const realQuote = {
  providerName: "real-provider",
  async quote() {
    return { price: 0.601, preClose: 0.615, open: 0.609, high: 0.610, low: 0.600 };
  }
};

(async () => {
  const sequential = await tryProviders(meta, [zeroQuote, realQuote], "quote");
  assert.strictEqual(sequential.providerName, "real-provider");
  assert.strictEqual(sequential.payload.price, 0.601);
  assert(sequential.errors.some((message) => message.includes("zero or invalid")));

  const fast = await tryProvidersFast(meta, [zeroQuote, realQuote], "quote", [], 500);
  assert.strictEqual(fast.providerName, "real-provider");
  assert.strictEqual(fast.payload.price, 0.601);

  console.log("provider validation ok");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
