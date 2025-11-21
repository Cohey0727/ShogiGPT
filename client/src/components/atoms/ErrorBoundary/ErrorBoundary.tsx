import { Component, type ReactNode } from "react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../Dialog/Dialog";
import { Button } from "../Button/Button";
import styles from "./ErrorBoundary.css";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // カスタムフォールバックが提供されている場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // デフォルトのエラー画面を表示
      return (
        <div className={styles.container}>
          <Dialog open={true}>
            <DialogContent>
              <DialogTitle>エラーが発生しました</DialogTitle>
              <DialogDescription className={styles.message}>
                {this.state.error.message}
              </DialogDescription>
              <div className={styles.buttonContainer}>
                <Button onClick={this.resetError}>再試行</Button>
                <Link href="/">
                  <Button variant="outlined" onClick={this.resetError}>
                    ホーム画面へ
                  </Button>
                </Link>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    }

    return this.props.children;
  }
}
