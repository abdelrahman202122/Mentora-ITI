/**
 * EXAMPLE: Using React Hook Form with API Integration
 *
 * This file demonstrates how to integrate React Hook Form with the AuthService
 * for client-side form handling. You can adapt this for your components.
 *
 * Installation:
 *   npm install react-hook-form
 *
 * Usage in a component:
 * ```tsx
 * import { useForm } from "react-hook-form";
 * import { zodResolver } from "@hookform/resolvers/zod";
 * import { loginSchema } from "@/lib/schemas";
 * import useAuth from "@/hooks/useAuth";
 *
 * export default function LoginFormExample() {
 *   const { login, loading, error } = useAuth();
 *   const {
 *     register,
 *     handleSubmit,
 *     formState: { errors },
 *   } = useForm({
 *     resolver: zodResolver(loginSchema),
 *   });
 *
 *   return (
 *     <form onSubmit={handleSubmit((data) => login(data))}>
 *       <input {...register("email")} />
 *       {errors.email && <span>{errors.email.message}</span>}
 *
 *       <input {...register("password")} type="password" />
 *       {errors.password && <span>{errors.password.message}</span>}
 *
 *       <button type="submit" disabled={loading}>
 *         {loading ? "Logging in..." : "Login"}
 *       </button>
 *
 *       {error && <div className="error">{error}</div>}
 *     </form>
 *   );
 * }
 * ```
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import useAuth from '@/hooks/useAuth';
import { loginSchema, registerSchema } from '@/lib/schemas';
import type { LoginPayload, RegisterPayload } from '@/lib/schemas';

/**
 * Example Login form component using React Hook Form
 */
export function LoginFormExample() {
  const { login, loading, error, fieldErrors } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginPayload) => {
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full border rounded px-3 py-2"
        />
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email.message}</span>
        )}
        {fieldErrors.email && (
          <span className="text-red-500 text-sm">{fieldErrors.email[0]}</span>
        )}
      </div>

      <div>
        <label>Password</label>
        <input
          {...register('password')}
          type="password"
          className="w-full border rounded px-3 py-2"
        />
        {errors.password && (
          <span className="text-red-500 text-sm">
            {errors.password.message}
          </span>
        )}
        {fieldErrors.password && (
          <span className="text-red-500 text-sm">
            {fieldErrors.password[0]}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white rounded py-2 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

/**
 * Example Register form component using React Hook Form
 */
export function RegisterFormExample() {
  const { register: registerUser, loading, error, fieldErrors } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPayload>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterPayload) => {
    try {
      await registerUser(data);
      // Show success message and maybe redirect
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Name</label>
        <input
          {...register('name')}
          type="text"
          className="w-full border rounded px-3 py-2"
        />
        {errors.name && (
          <span className="text-red-500 text-sm">{errors.name.message}</span>
        )}
      </div>

      <div>
        <label>Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full border rounded px-3 py-2"
        />
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email.message}</span>
        )}
        {fieldErrors.email && (
          <span className="text-red-500 text-sm">{fieldErrors.email[0]}</span>
        )}
      </div>

      <div>
        <label>Password</label>
        <input
          {...register('password')}
          type="password"
          className="w-full border rounded px-3 py-2"
        />
        {errors.password && (
          <span className="text-red-500 text-sm">
            {errors.password.message}
          </span>
        )}
      </div>

      <div>
        <label>Role</label>
        <select
          {...register('role')}
          className="w-full border rounded px-3 py-2"
        >
          <option value="learner">Student</option>
          <option value="tutor">Teacher</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white rounded py-2 disabled:opacity-50"
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
