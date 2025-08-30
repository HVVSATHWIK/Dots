export type MintInput = {
  title: string;
  artisanName: string;
  images: string[];
  rawEvidence: { voiceNote: File | null; workInProgress: File[] };
};

export type BirthCertificate = {
  tokenId: string;
  qrUrl: string;
  explorerUrl: string;
};
