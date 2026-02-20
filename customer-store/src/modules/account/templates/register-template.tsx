"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

const RegisterTemplate = ({ inviteToken }: { inviteToken?: string }) => {
    return (
        <div className="w-full flex justify-center px-8 py-8">
            <div className="max-w-sm w-full flex flex-col items-center">
                <Register setCurrentView={() => { }} inviteToken={inviteToken} />
            </div>
        </div>
    )
}

export default RegisterTemplate
