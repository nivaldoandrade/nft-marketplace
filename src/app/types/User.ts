export type User = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
};

export type Profile = User & {
  ensName: string;
  walletNickname: string;
};
