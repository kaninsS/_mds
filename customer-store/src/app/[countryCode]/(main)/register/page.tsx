import { Metadata } from "next"

import RegisterTemplate from "@modules/account/templates/register-template"

export const metadata: Metadata = {
    title: "Register",
    description: "Register for a Medusa Store account.",
}

export default async function Register({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const inviteToken = typeof params.invite === "string" ? params.invite : undefined

    return <RegisterTemplate inviteToken={inviteToken} />
}

