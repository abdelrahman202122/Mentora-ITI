

"use client"

import { useRef, useState, useEffect } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { uploadAvatar, deleteAvatar } from "@/services/setting/avatarservice"
import { updateProfileName } from "@/services/setting/editName"
import { useCurrentUser, authKeys } from "@/hooks/auth/use-auth"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function SettingsPage() {
  const t = useTranslations("SettingsPage")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { data: currentUser } = useCurrentUser()

  const [fullName, setFullName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [avatarRemoved, setAvatarRemoved] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const hasSeededRef = useRef(false)
  useEffect(() => {
    if (currentUser && !hasSeededRef.current) {
      setFullName(currentUser.name ?? "")
      hasSeededRef.current = true
    }
  }, [currentUser])

  const savedAvatarUrl = currentUser?.avatar ?? null
  const displayedAvatarUrl =
    previewUrl ?? (avatarRemoved ? null : savedAvatarUrl)

  function updateCache(updater: (old: typeof currentUser) => typeof currentUser) {
    queryClient.setQueryData(authKeys.currentUser, updater)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (previewUrl) URL.revokeObjectURL(previewUrl)

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setAvatarRemoved(false)
    setSaveError(null)
    setSaveSuccess(false)

    e.target.value = ""
  }

  function handleRemove() {
    const hasExistingAvatar = !!savedAvatarUrl
    const hasSelectedFile = !!selectedFile

    if (!hasExistingAvatar && !hasSelectedFile) {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setSelectedFile(null)
      setPreviewUrl(null)
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(null)
    setPreviewUrl(null)
    setAvatarRemoved(hasExistingAvatar)
    setSaveError(null)
    setSaveSuccess(false)
  }

  async function handleSaveChanges() {
    const trimmedName = fullName.trim()

    const nameChanged = trimmedName !== currentUser?.name
    const avatarUploadPending = selectedFile !== null
    const avatarRemovePending = !selectedFile && avatarRemoved

    if (!nameChanged && !avatarUploadPending && !avatarRemovePending) return

    if (nameChanged && trimmedName.length === 0) {
      setSaveError(t("emptyNameError"))
      return
    }

    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    const tasks: Promise<{ kind: "avatarUpload" | "avatarRemove" | "name" }>[] = []

    if (avatarUploadPending && selectedFile) {
      tasks.push(
        uploadAvatar(selectedFile).then((res) => {
          updateCache((old) => (old ? { ...old, avatar: res.avatar } : old))
          return { kind: "avatarUpload" as const }
        })
      )
    }

    if (avatarRemovePending) {
      tasks.push(
        deleteAvatar().then(() => {
          updateCache((old) => (old ? { ...old, avatar: undefined } : old))
          return { kind: "avatarRemove" as const }
        })
      )
    }

    if (nameChanged) {
      tasks.push(
        updateProfileName(trimmedName).then((res) => {
          updateCache((old) => (old ? { ...old, name: res.name } : old))
          setFullName(res.name)
          return { kind: "name" as const }
        })
      )
    }

    const results = await Promise.allSettled(tasks)

    const succeededKinds = new Set(
      results
        .filter((r): r is PromiseFulfilledResult<{ kind: "avatarUpload" | "avatarRemove" | "name" }> => r.status === "fulfilled")
        .map((r) => r.value.kind)
    )

    if (succeededKinds.has("avatarUpload")) {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setSelectedFile(null)
      setPreviewUrl(null)
    }

    if (succeededKinds.has("avatarRemove")) {
      setAvatarRemoved(false)
    }

    const failures = results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected"
    )

    if (failures.length > 0) {
      const messages = failures.map((f) =>
        f.reason instanceof Error ? f.reason.message : t("genericError")
      )
      setSaveError(Array.from(new Set(messages)).join(" "))
    } else {
      setSaveSuccess(true)
    }

    setSaving(false)
  }

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#11142D]">{t("title")}</h1>
        <p className="text-sm text-[#68718B] mt-1 mb-6 sm:mb-8">
          {t("description")}
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-8">
          <h2 className="text-lg font-bold text-[#11142D]">{t("profileInfo")}</h2>
          <p className="text-sm text-[#68718B] mt-1 mb-6">
            {t("profileDesc")}
          </p>

          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-4">
            <div className="w-full sm:w-40 shrink-0">
              <p className="text-sm font-semibold text-[#11142D] mb-1">{t("profilePicture")}</p>
              <p className="text-xs text-[#68718B] mb-2 sm:mb-0">
                {t("avatarDesc")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full">
              <div className="w-14 h-14 rounded-full bg-[#E0E7FF] overflow-hidden flex items-center justify-center shrink-0">
                {displayedAvatarUrl ? (
                  <img
                    src={
                      displayedAvatarUrl.startsWith("http") ||
                      displayedAvatarUrl.startsWith("blob:")
                        ? displayedAvatarUrl
                        : `/api/files/avatars/${displayedAvatarUrl}`
                    }
                    className="w-full h-full object-cover"
                    alt="avatar"
                  />
                ) : (
                  <span className="text-[#5051F9] font-bold text-sm">
                    {getInitials(fullName)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 grow">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#5051F9] hover:bg-[#4041DB] text-sm py-2 px-3 sm:px-4 h-9 flex items-center gap-2"
                >
                  <Upload size={14} /> {t("uploadNew")}
                </Button>

                <button
                  onClick={handleRemove}
                  className="text-sm font-semibold px-3 sm:px-4 h-9 rounded-lg bg-[#EEF2FF] text-[#5051F9] hover:bg-[#E0E7FF] transition-colors"
                >
                  {t("remove")}
                </button>
              </div>
            </div>
          </div>

          {selectedFile && (
            <p className="text-xs text-[#5051F9] mb-4 sm:inline-block sm:ps-44">
              {t("newPhotoSelected")}
            </p>
          )}
          {!selectedFile && avatarRemoved && (
            <p className="text-xs text-[#5051F9] mb-4 sm:inline-block sm:ps-44">
              {t("photoWillBeRemoved")}
            </p>
          )}

          {/* Name Section */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 mt-6 pt-4 border-t border-gray-50">
            <div className="w-full sm:w-40 shrink-0">
              <p className="text-sm font-semibold text-[#11142D] mb-1">{t("fullName")}</p>
              <p className="text-xs text-[#68718B] mb-2 sm:mb-0">{t("nameDesc")}</p>
            </div>

            <div className="w-full max-w-md">
              <Input
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  setSaveError(null)
                  setSaveSuccess(false)
                }}
                className="w-full h-11 bg-[#F8FAFC] border-gray-200"
              />
            </div>
          </div>

          {saveError && (
            <p className="text-red-600 text-xs mt-4 text-start sm:text-end">{saveError}</p>
          )}
          {saveSuccess && (
            <p className="text-green-600 text-xs mt-4 text-start sm:text-end">{t("successMessage")}</p>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-4 border-t border-gray-50">
            <button
              className="text-sm font-semibold text-[#5051F9] h-10 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => {
                if (previewUrl) URL.revokeObjectURL(previewUrl)
                setFullName(currentUser?.name ?? "")
                setSelectedFile(null)
                setPreviewUrl(null)
                setAvatarRemoved(false)
                setSaveError(null)
                setSaveSuccess(false)
              }}
            >
              {t("cancel")}
            </button>

            <Button
              onClick={handleSaveChanges}
              disabled={saving}
              className="bg-[#5051F9] hover:bg-[#4041DB] h-10 px-6 text-sm"
            >
              {saving ? t("saving") : t("saveChanges")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}