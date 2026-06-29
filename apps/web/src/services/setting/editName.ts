// import {UpdatedProfile} from "@/types/edit/edit"

// export async function updateProfileName(name: string): Promise<UpdatedProfile> {
//   const response = await fetch("/api/users/profile", {
//     method: "PATCH",
//     headers: { "Content-Type": "application/json" },
//     credentials: "include",
//     body: JSON.stringify({ name }),
//   })

//   const body = await response.json()

//   if (!response.ok || !body.success) {
//     throw new Error(body.message ?? "Failed to update profile.")
//   }

//   if (!body.data || typeof body.data.name !== "string") {
//     throw new Error("Unexpected response from server.")
//   }

//   return body.data
// }


import api from "@/lib/axios"
import { UpdatedProfile } from "@/types/edit/edit"

export async function updateProfileName(name: string): Promise<UpdatedProfile> {
  const response = await api.patch("/users/profile", { name })
  const body = response.data

  if (!body.success) {
    throw new Error(body.message ?? "Failed to update profile.")
  }

  if (!body.data || typeof body.data.name !== "string") {
    throw new Error("Unexpected response from server.")
  }

  return body.data
}