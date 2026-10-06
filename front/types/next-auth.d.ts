import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    role: string;
    walletAddress: string;
    privateKey: string;
  }

  interface Session {
    user: User & {
      role: string;
      walletAddress: string;
      privateKey: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    walletAddress: string;
    privateKey: string;
  }
}
