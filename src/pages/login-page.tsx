import { useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { Link, useSearchParams } from "react-router"

import { useAuth } from "@/hooks/use-auth"
import { useDocumentTitle } from "@/hooks/use-document-title"
import {
  authErrorMessage,
  fieldErrorsFrom,
  hasErrors,
  validateLogin,
  type FieldErrors,
  type LoginValues,
} from "@/lib/auth-validation"
import { authPageLink } from "@/lib/redirect"
import { AuthLayout } from "@/components/auth/auth-layout"
import { FormAlert } from "@/components/auth/form-alert"
import { FormField, PasswordField } from "@/components/auth/form-field"
import { SubmitButton, type SubmitState } from "@/components/auth/submit-button"

type Field = keyof LoginValues
const FIELDS: readonly Field[] = ["email", "password"]
const fieldId = (field: Field) => `login-${field}`

export function LoginPage() {
  useDocumentTitle("Sign in · Jeovely")
  const { login, notice } = useAuth()
  const [searchParams] = useSearchParams()

  const [values, setValues] = useState<LoginValues>({ email: "", password: "" })
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [state, setState] = useState<SubmitState>("idle")
  const [attempted, setAttempted] = useState(false)
  // A ref, not state: blocks a second submit even before React re-renders.
  const inFlight = useRef(false)

  const onChange = (field: Field) => (event: ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [field]: event.target.value }
    setValues(next)
    // After the first attempt, keep errors in sync as the user fixes them.
    if (attempted) setErrors((prev) => ({ ...prev, [field]: validateLogin(next)[field] }))
  }

  const onBlur = (field: Field) => () => {
    if (values[field]) setErrors((prev) => ({ ...prev, [field]: validateLogin(values)[field] }))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    setAttempted(true)

    const found = validateLogin(values)
    setErrors(found)
    if (hasErrors(found)) {
      setFormError(null)
      focusFirst(found)
      return
    }

    inFlight.current = true
    setState("submitting")
    setFormError(null)
    try {
      await login({ email: values.email.trim(), password: values.password })
      // GuestRoute now sees an authenticated user and redirects to ?next= or the dashboard.
      setState("success")
    } catch (error) {
      const serverErrors = fieldErrorsFrom(error, FIELDS)
      setErrors(serverErrors)
      setFormError(authErrorMessage(error, "login"))
      setState("idle")
      inFlight.current = false
      focusFirst(serverErrors)
    }
  }

  const busy = state !== "idle"

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to keep your workflows running."
      footer={
        <>
          New to Jeovely?{" "}
          <Link to={authPageLink("/register", searchParams)} className="font-semibold text-primary-strong underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={onSubmit} aria-label="Sign in" className="grid gap-5">
        {formError ? (
          <FormAlert tone="error">{formError}</FormAlert>
        ) : notice === "expired" ? (
          <FormAlert tone="info">Your session has expired. Sign in again to continue.</FormAlert>
        ) : notice === "signed-out" ? (
          <FormAlert tone="info">You've been signed out.</FormAlert>
        ) : null}

        <fieldset disabled={busy} className="grid gap-5">
          <FormField
            id={fieldId("email")}
            name="email"
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@company.com"
            required
            value={values.email}
            onChange={onChange("email")}
            onBlur={onBlur("email")}
            error={errors.email}
          />
          <PasswordField
            id={fieldId("password")}
            name="password"
            label="Password"
            autoComplete="current-password"
            required
            value={values.password}
            onChange={onChange("password")}
            onBlur={onBlur("password")}
            error={errors.password}
          />
        </fieldset>

        <SubmitButton state={state} idleLabel="Sign in" submittingLabel="Signing in…" successLabel="Signed in" />
      </form>
    </AuthLayout>
  )
}

function focusFirst(errors: FieldErrors<Field>) {
  const field = FIELDS.find((f) => errors[f])
  if (field) document.getElementById(fieldId(field))?.focus()
}
