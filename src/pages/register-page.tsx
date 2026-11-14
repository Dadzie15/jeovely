import { useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { Check, Circle } from "lucide-react"
import { Link, useSearchParams } from "react-router"

import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { useDocumentTitle } from "@/hooks/use-document-title"
import {
  authErrorMessage,
  fieldErrorsFrom,
  hasErrors,
  NAME_MAX,
  passwordRules,
  validateRegister,
  type FieldErrors,
  type RegisterValues,
} from "@/lib/auth-validation"
import { authPageLink } from "@/lib/redirect"
import { AuthLayout } from "@/components/auth/auth-layout"
import { FormAlert } from "@/components/auth/form-alert"
import { FormField, PasswordField } from "@/components/auth/form-field"
import { SubmitButton, type SubmitState } from "@/components/auth/submit-button"

type Field = keyof RegisterValues
const FIELDS: readonly Field[] = ["name", "email", "password", "confirmPassword"]
const fieldId = (field: Field) => `register-${field}`

export function RegisterPage() {
  useDocumentTitle("Create your account · Jeovely")
  const { register } = useAuth()
  const [searchParams] = useSearchParams()

  const [values, setValues] = useState<RegisterValues>({ name: "", email: "", password: "", confirmPassword: "" })
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [emailTaken, setEmailTaken] = useState(false)
  const [state, setState] = useState<SubmitState>("idle")
  const [attempted, setAttempted] = useState(false)
  // A ref, not state: blocks a second submit even before React re-renders.
  const inFlight = useRef(false)

  const onChange = (field: Field) => (event: ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [field]: event.target.value }
    setValues(next)
    if (field === "email") setEmailTaken(false)
    if (!attempted) return
    // After the first attempt, keep errors in sync as the user fixes them
    // (editing the password also re-checks the confirmation).
    const fresh = validateRegister(next)
    setErrors((prev) => ({
      ...prev,
      [field]: fresh[field],
      ...(field === "password" && next.confirmPassword ? { confirmPassword: fresh.confirmPassword } : {}),
    }))
  }

  const onBlur = (field: Field) => () => {
    if (values[field]) setErrors((prev) => ({ ...prev, [field]: validateRegister(values)[field] }))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    setAttempted(true)

    const found = validateRegister(values)
    setErrors(found)
    if (hasErrors(found)) {
      setFormError(null)
      focusFirst(found)
      return
    }

    inFlight.current = true
    setState("submitting")
    setFormError(null)
    setEmailTaken(false)
    try {
      await register({ name: values.name.trim(), email: values.email.trim(), password: values.password })
      // The API signs the new user in; GuestRoute now redirects to ?next= or the dashboard.
      setState("success")
    } catch (error) {
      const serverErrors = fieldErrorsFrom(error, FIELDS)
      const taken = error instanceof ApiError && error.code === "EMAIL_TAKEN"
      if (taken) serverErrors.email = "An account with this email already exists."
      setErrors(serverErrors)
      setEmailTaken(taken)
      setFormError(authErrorMessage(error, "register"))
      setState("idle")
      inFlight.current = false
      focusFirst(serverErrors)
    }
  }

  const busy = state !== "idle"
  const loginLink = authPageLink("/login", searchParams)

  return (
    <AuthLayout
      title="Create your Jeovely account"
      description="Start automating in minutes. Free for 14 days, no credit card required."
      footer={
        <>
          Already have an account?{" "}
          <Link to={loginLink} className="font-semibold text-primary-strong underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={onSubmit} aria-label="Create account" className="grid gap-5">
        {formError && (
          <FormAlert tone="error">
            {formError}
            {emailTaken && (
              <>
                {" "}
                <Link to={loginLink} className="font-semibold underline underline-offset-4">
                  Sign in instead
                </Link>
              </>
            )}
          </FormAlert>
        )}

        <fieldset disabled={busy} className="grid gap-5">
          <FormField
            id={fieldId("name")}
            name="name"
            label="Full name"
            autoComplete="name"
            autoCapitalize="words"
            placeholder="Ada Lovelace"
            maxLength={NAME_MAX}
            required
            value={values.name}
            onChange={onChange("name")}
            onBlur={onBlur("name")}
            error={errors.name}
          />
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
            autoComplete="new-password"
            required
            value={values.password}
            onChange={onChange("password")}
            onBlur={onBlur("password")}
            error={errors.password}
            hint={<PasswordChecklist password={values.password} />}
          />
          <PasswordField
            id={fieldId("confirmPassword")}
            name="confirmPassword"
            label="Confirm password"
            autoComplete="new-password"
            required
            value={values.confirmPassword}
            onChange={onChange("confirmPassword")}
            onBlur={onBlur("confirmPassword")}
            error={errors.confirmPassword}
          />
        </fieldset>

        <SubmitButton state={state} idleLabel="Create account" submittingLabel="Creating your account…" successLabel="Account created" />
      </form>
    </AuthLayout>
  )
}

/** Live password requirements, matching the API's rules. */
function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Password requirements">
      {passwordRules.map((rule) => {
        const met = rule.test(password)
        return (
          <li
            key={rule.id}
            className={cn("flex items-center gap-1.5 transition-colors duration-200", met && "text-success")}
          >
            {met ? (
              <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
            ) : (
              <Circle aria-hidden="true" className="size-3" strokeWidth={2.5} />
            )}
            {rule.label}
            <span className="sr-only">{met ? " (met)" : " (not met)"}</span>
          </li>
        )
      })}
    </ul>
  )
}

function focusFirst(errors: FieldErrors<Field>) {
  const field = FIELDS.find((f) => errors[f])
  if (field) document.getElementById(fieldId(field))?.focus()
}
