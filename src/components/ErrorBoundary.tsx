import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleBack = () => {
        this.setState({ hasError: false, error: undefined });

        if (window.history.length > 1) {
            window.history.back();
            return;
        }

        window.location.assign("/");
    };

    private handleHome = () => {
        this.setState({ hasError: false, error: undefined });
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
                        An unexpected error occurred in this part of the application. The issue has been logged.
                    </p>
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
