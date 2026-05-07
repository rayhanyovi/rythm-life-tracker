"use client";

import { useState, useTransition } from "react";

type UseMutationResult = {
  clearMessages: () => void;
  errorMessage: string | null;
  isPending: boolean;
  runMutation: (action: () => Promise<void>) => void;
  setError: (message: string | null) => void;
  setStatus: (message: string | null) => void;
  statusMessage: string | null;
};

/**
 * Wraps useTransition with consistent error/status message state.
 *
 * - `runMutation(action)` — clears messages, runs `action` in a transition,
 *   catches thrown errors and puts them into `errorMessage`.
 * - `setError` / `setStatus` — for setting messages from outside the mutation
 *   (e.g. initial data-load failures, post-action success messages).
 *
 * Usage:
 *   const { isPending, errorMessage, statusMessage, runMutation, setStatus } = useMutation();
 *   runMutation(async () => {
 *     const res = await fetch(...);
 *     if (!res.ok) throw new Error("Failed.");
 *     setStatus("Saved!");
 *   });
 */
export function useMutation(): UseMutationResult {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const clearMessages = () => {
    setErrorMessage(null);
    setStatusMessage(null);
  };

  const runMutation = (action: () => Promise<void>) => {
    setErrorMessage(null);
    setStatusMessage(null);

    startTransition(async () => {
      try {
        await action();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Something went wrong.",
        );
      }
    });
  };

  return {
    clearMessages,
    errorMessage,
    isPending,
    runMutation,
    setError: setErrorMessage,
    setStatus: setStatusMessage,
    statusMessage,
  };
}
