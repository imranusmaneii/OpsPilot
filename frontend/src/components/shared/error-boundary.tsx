"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-2xl bg-red-500/10 p-4">
            <p className="text-red-400">Something went wrong</p>
          </div>
          <p className="mb-4 text-sm text-[#94A3B8]">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="rounded-xl bg-[#DC2626]/15 px-4 py-2 text-sm text-[#DC2626] transition-colors hover:bg-[#DC2626]/25"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
