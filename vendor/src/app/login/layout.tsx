import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | Vendor Dashboard",
    description: "Sign in to your vendor account",
};

export default function LoginLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-ui-bg-subtle flex items-center justify-center">
            {children}
        </div>
    );
}
