"use client"

import { saveTransaction } from "@/services/paymentHistory/payment-history-service"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import { Lock, CreditCard, Loader2 } from "lucide-react"
import { SummaryCard } from "@/components/learner/SummaryCard"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const SERVICE_FEE = 2.5

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCardNumber(val: string): string {
  return val.replace(/\D/g, "")
    .slice(0, 16).replace(/(.{4})/g, "$1 ").trim()
}

function formatExpiry(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + " / " + digits.slice(2)
  return digits
}

function digitsOnly(val: string): string {
  return val.replace(/[\s/]/g, "")
}

function validateExpiry(val: string): string | null {
  const digits = digitsOnly(val)

  if (digits.length !== 4) return "Enter a valid Month or a valid year "

  const month = Number(digits.slice(0, 2))
  const year  = Number("20" + digits.slice(2))

  if (month < 1 || month > 12) return "Invalid month — must be 01 to 12"

  const now        = new Date()
  const expiryDate = new Date(year, month - 1, 1)

  if (expiryDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
    return "Card has expired"
  }

  return null
}

// ── Component ─────────────────────────────────────────────────────────────────

function PaymentContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const params       = useParams()
  const locale       = (params.locale as string) ?? "en"

  const tutorId   = searchParams.get("tutorId")   ?? ""
  const tutorName = searchParams.get("tutorName") ?? "Tutor"
  const subject   = searchParams.get("subject")   ?? "Session"
  const date      = searchParams.get("date")      ?? ""
  const time      = searchParams.get("time")      ?? ""
  const currency  = searchParams.get("currency")  ?? "$"

  // FIX #3: Validate numeric query params — fall back to safe defaults if NaN
  const rawHourlyRate = Number(searchParams.get("hourlyRate"))
  const rawDuration   = Number(searchParams.get("duration"))
  const hourlyRate    = isNaN(rawHourlyRate) || rawHourlyRate <= 0 ? 45 : rawHourlyRate
  const duration      = isNaN(rawDuration)   || rawDuration   <= 0 ? 60 : rawDuration

  const sessionCost = (hourlyRate * duration) / 60
  const total       = sessionCost + SERVICE_FEE

  const [cardNumber,  setCardNumber]  = useState("")
  const [expiry,      setExpiry]      = useState("")
  const [cvv,         setCvv]         = useState("")
  const [expiryError, setExpiryError] = useState<string | null>(null)
  const [method,      setMethod]      = useState<"card" | "paypal">("card")
  const [submitting,  setSubmitting]  = useState(false)

  function handleExpiryBlur() {
    if (expiry.length === 0) return
    setExpiryError(validateExpiry(expiry))
  }

  function handleExpiryChange(val: string) {
    setExpiry(formatExpiry(val))
    setExpiryError(null)
  }

  async function handleSubmit() {
    // FIX #2: Only validate expiry for card payments
    if (method === "card") {
      const expiryErr = validateExpiry(expiry)
      if (expiryErr) {
        setExpiryError(expiryErr)
        return
      }
    }

    setSubmitting(true)

    // FIX #1: Wrap in try/catch/finally so submitting is always reset
    try {
      await new Promise((r) => setTimeout(r, 1500))

      saveTransaction({
        id: "txn_" + Date.now(),
        date: new Date().toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        }),
        tutorName,
        subject,
        amount: total,
        currency,
        duration,
        status: "Completed",
      })

      router.push(
        `/${locale}/payment/success` +
        `?tutorName=${encodeURIComponent(tutorName)}` +
        `&subject=${encodeURIComponent(subject)}` +
        `&date=${encodeURIComponent(date)}` +
        `&time=${encodeURIComponent(time)}` +
        `&tutorId=${tutorId}`
      )
    } catch (err) {
      console.error("Payment failed:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const isCardInvalid =
    method === "card" &&
    (
      digitsOnly(cardNumber).length !== 16 ||
      digitsOnly(expiry).length !== 4      ||
      !!expiryError                         ||
      cvv.length < 3
    )

  return (
    <div className="min-h-screen flex flex-col bg-white">

      <div className="max-w-5xl mx-auto w-full px-4 md:px-8 pt-6 pb-2">
        <h1 className="text-xl font-bold text-gray-800">Booking Payment</h1>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: Payment form ─────────────────────────────────────── */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">
                Secure Payment
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">

              {/* Method toggle */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={method === "card" ? "outline" : "ghost"}
                  onClick={() => setMethod("card")}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                    method === "card"
                      ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  <CreditCard size={16} aria-hidden />
                  Credit or Debit Card
                </Button>

                <Button
                  type="button"
                  variant={method === "paypal" ? "outline" : "ghost"}
                  onClick={() => setMethod("paypal")}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                    method === "paypal"
                      ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  PayPal
                </Button>
              </div>

              {/* Card fields */}
              {method === "card" && (
                <div className="space-y-4">

                  {/* Card Number */}
                  <div>
                    <label htmlFor="card-number" className="block text-sm text-gray-500 mb-1">
                      Card Number
                    </label>
                    <Input
                      id="card-number"
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      className="h-11 rounded-xl bg-gray-50 text-sm text-gray-700 tracking-widest"
                    />
                  </div>

                  <div className="flex gap-3">

                    {/* Expiry */}
                    <div className="flex-1">
                      <label htmlFor="expiry" className="block text-sm text-gray-500 mb-1">
                        Expiry Date
                      </label>
                      <Input
                        id="expiry"
                        type="text"
                        inputMode="numeric"
                        value={expiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        onBlur={handleExpiryBlur}
                        placeholder="MM / YY"
                        className={`h-11 rounded-xl bg-gray-50 text-sm text-gray-700 ${
                          expiryError ? "border-red-400 focus-visible:ring-red-300" : ""
                        }`}
                      />
                      {expiryError && (
                        <p role="alert" className="text-xs text-red-500 mt-1">
                          {expiryError}
                        </p>
                      )}
                    </div>

                    {/* CVV */}
                    <div className="flex-1">
                      <label htmlFor="cvv" className="block text-sm text-gray-500 mb-1">
                        CVV
                      </label>
                      <Input
                        id="cvv"
                        type="password"
                        inputMode="numeric"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="•••"
                        className="h-11 rounded-xl bg-gray-50 text-sm text-gray-700"
                      />
                    </div>

                  </div>
                </div>
              )}

              {/* PayPal */}
              {method === "paypal" && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  You will be redirected to PayPal to complete payment.
                </div>
              )}

              {/* Security badge */}
              <div className="flex items-start gap-3 bg-indigo-50 rounded-xl p-4">
                <Lock size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" aria-hidden />
                <p className="text-xs text-indigo-700 leading-relaxed">
                  <span className="font-semibold">Mentora Protection</span> — Your payment is
                  encrypted and stored securely. Funds are held until the lesson is completed
                  and confirmed by you.
                </p>
              </div>

            </CardContent>
          </Card>

          {/* ── Right: Order summary ───────────────────────────────────── */}
          <Card className="w-full lg:w-80 flex-shrink-0">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">
                Order Summary
              </CardTitle>
            </CardHeader>

            <CardContent>
              <SummaryCard
                tutorName={tutorName}
                subject={subject}
                hourlyRate={hourlyRate}
                duration={duration}
                currency={currency}
                date={date}
                time={time}
              />
            </CardContent>

            <CardFooter className="flex flex-col gap-3 bg-transparent border-0 pt-0">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || isCardInvalid}
                size="lg"
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" aria-hidden />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={15} aria-hidden />
                    Confirm & Pay {currency}{total.toFixed(2)}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-400">
                By confirming, you agree to Mentora&apos;s{" "}
                <Link href="#" className="underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="#" className="underline">Refund Policy</Link>.
              </p>
            </CardFooter>
          </Card>

        </div>
      </main>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
