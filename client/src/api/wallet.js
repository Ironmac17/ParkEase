import api from "./axios";

export const getMyWallet = () => {
  return api.get("/wallet/me");
};

export const getOwnerWallet = () => {
  return api.get("/owner/wallet");
};

export const getAdminWallets = () => {
  return api.get("/admin/wallets");
};
