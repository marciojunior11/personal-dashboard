"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

/**
 * Applies the chosen theme as a `light` or `dark` class on `<html>`, which is
 * what the `dark:` variant and the `.dark` tokens in `globals.css` key on.
 * Follows the operating system until the user picks one, and remembers it.
 */
export function ThemeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
