import { Metadata } from "next"

import RegisterTemplate from "@modules/account/templates/register-template"

export const metadata: Metadata = {
    title: "Register",
    description: "Register for a Medusa Store account.",
}

export default function Register({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const inviteToken = typeof searchParams.invite === "string" ? searchParams.invite : undefined

    return <RegisterTemplate inviteToken={inviteToken} />
}
