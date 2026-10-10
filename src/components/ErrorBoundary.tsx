import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    componentStack?: string;
    copied: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        copied: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, copied: false };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ componentStack: errorInfo.componentStack ?? undefined });
    }

    private handleCopyDetails = async () => {
        const details = [
            this.state.error?.stack || this.state.error?.message || "Unknown application error",
            this.state.componentStack,
            `Route: ${window.location.pathname}`,
        ].filter(Boolean).join("\n\n");

        try {
            await navigator.clipboard.writeText(details);
            this.setState({ copied: true });
        } catch {
            this.setState({ copied: false });
        }
    };

    private handleBack = () => {
        this.setState({ hasError: false, error: undefined, componentStack: undefined, copied: false });

        if (window.history.length > 1) {
            window.history.back();
            return;
        }

        window.location.assign("/");
    };

    private handleHome = () => {
        this.setState({ hasError: false, error: undefined, componentStack: undefined, copied: false });
        window.location.assign("/");
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                    <div className="bg-destructive/10 text-destructive p-4 rounded-full mb-6">
                        <AlertCircle className="w-12 h-12" />
                    </div>
                    <h1 className="font-bebas text-4xl text-foreground mb-2">SOMETHING WENT WRONG</h1>
                    <p className="text-muted-foreground font-barlow text-center max-w-md mb-8">
                        An unexpected error occurred in this part of the application. You can copy the technical details below to help us identify it.
                    </p>
                    <details className="w-full max-w-2xl mb-6 rounded border border-border bg-card p-3 text-sm">
                        <summary className="cursor-pointer text-foreground">Technical details</summary>
                        <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words text-left text-xs text-muted-foreground">
                            {[this.state.error?.stack || this.state.error?.message, this.state.componentStack, `Route: ${window.location.pathname}`].filter(Boolean).join("\n\n")}
                        </pre>
                        <Button onClick={this.handleCopyDetails} variant="outline" size="sm" className="mt-3">
                            {this.state.copied ? "COPIED" : "COPY ERROR DETAILS"}
                        </Button>
                    </details>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button
                            onClick={this.handleBack}
                            variant="outline"
                            className="font-bebas tracking-wider min-w-32"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            BACK
                        </Button>
                        <Button
                            onClick={() => window.location.reload()}
                            className="font-bebas tracking-wider min-w-32"
                        >
                            RELOAD PAGE
                        </Button>
                        <Button
                            onClick={this.handleHome}
                            variant="ghost"
                            className="font-bebas tracking-wider min-w-32"
                        >
                            <Home className="w-4 h-4" />
                            HOME
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
