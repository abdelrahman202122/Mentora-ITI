// import {UploadedUser} from "@/types/edit/edit"
// export async function uploadAvatar(file: File): Promise<UploadedUser> {
//   const formData = new FormData()
//   formData.append("avatar", file)

//   const response = await fetch("/api/users/me/avatar", {
//     method: "POST",
//     credentials: "include",
//     // no Content-Type header here on purpose — the browser sets the correct
//     // multipart/form-data boundary automatically; setting it manually breaks
//     // the upload
//     body: formData,
//   })

//   const body = await response.json()

//   if (!response.ok || !body.success) {
//     throw new Error(body.message ?? "Failed to upload avatar.")
//   }

//   if (!body.data || typeof body.data.avatar !== "string") {
//     throw new Error("Unexpected response from server.")
//   }

//   return body.data
// }

// export async function deleteAvatar(): Promise<UploadedUser> {
//   const response = await fetch("/api/users/me/avatar", {
//     method: "DELETE",
//     credentials: "include",
//   })

//   const body = await response.json()

//   if (!response.ok || !body.success) {
//     throw new Error(body.message ?? "Failed to remove avatar.")
//   }

//   // unlike upload, a successful removal legitimately has no `avatar` field
//   // at all (that's the point — there's no avatar anymore), so we only check
//   // that `data` itself exists, not that `avatar` is a string
//   if (!body.data) {
//     throw new Error("Unexpected response from server.")
//   }

//   return body.data
// }

import api from "@/lib/axios"
import { UploadedUser } from "@/types/edit/edit"

export async function uploadAvatar(file: File): Promise<UploadedUser> {
  const formData = new FormData()
  formData.append("avatar", file)

  // no Content-Type header here on purpose — same rule as with fetch: axios
  // (via the browser) sets the correct multipart/form-data boundary
  // automatically when given a FormData body; setting it manually breaks
  // the upload
  const response = await api.post("/users/me/avatar", formData)
  const body = response.data

  if (!body.success) {
    throw new Error(body.message ?? "Failed to upload avatar.")
  }

  if (!body.data || typeof body.data.avatar !== "string") {
    throw new Error("Unexpected response from server.")
  }

  return body.data
}

export async function deleteAvatar(): Promise<UploadedUser> {
  const response = await api.delete("/users/me/avatar")
  const body = response.data

  if (!body.success) {
    throw new Error(body.message ?? "Failed to remove avatar.")
  }

  // unlike upload, a successful removal legitimately has no `avatar` field
  // at all (that's the point — there's no avatar anymore), so we only check
  // that `data` itself exists, not that `avatar` is a string
  if (!body.data) {
    throw new Error("Unexpected response from server.")
  }

  return body.data
}