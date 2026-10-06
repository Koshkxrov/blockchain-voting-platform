import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    role: string;
    walletAddress: string;
  }

  interface Session {
    user: User & {
      role: string;
      walletAddress: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    walletAddress: string;
  }
}
