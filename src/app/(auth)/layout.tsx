import { ReactNode } from "react";
import { FileText, Sparkles, Zap, Shield } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Illustration (hidden on screens < 1024px width OR < 700px height) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 max-lg:[@media(max-height:700px)]:hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-300/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-start pt-12 xl:pt-16 px-8 xl:px-20 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 xl:mb-12">
            <div className="w-12 h-12 xl:w-14 xl:h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <FileText className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl xl:text-3xl font-bold">MD Preview</h1>
              <p className="text-white/70 text-xs xl:text-sm">
                Markdown Editor
              </p>
            </div>
          </div>

          {/* Hero Text */}
          <h2 className="text-3xl xl:text-5xl font-bold leading-tight mb-4 xl:mb-6">
            Create Beautiful
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-200">
              Documentation
            </span>
          </h2>

          <p className="text-white/80 text-base xl:text-lg mb-8 xl:mb-12 max-w-md leading-relaxed">
            Write, preview, and share markdown documents with real-time live
            preview and syntax highlighting.
          </p>

          {/* Features - Hidden on smaller heights */}
          <div className="space-y-3 xl:space-y-4 hidden xl:block">
            <div className="flex items-center gap-3 xl:gap-4">
              <div className="w-9 h-9 xl:w-10 xl:h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 xl:w-5 xl:h-5 text-yellow-300" />
              </div>
              <div>
                <p className="font-medium text-sm xl:text-base">
                  Real-time Preview
                </p>
                <p className="text-white/60 text-xs xl:text-sm">
                  See changes instantly as you type
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 xl:gap-4">
              <div className="w-9 h-9 xl:w-10 xl:h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 xl:w-5 xl:h-5 text-pink-300" />
              </div>
              <div>
                <p className="font-medium text-sm xl:text-base">
                  Syntax Highlighting
                </p>
                <p className="text-white/60 text-xs xl:text-sm">
                  Beautiful code blocks in any language
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 xl:gap-4">
              <div className="w-9 h-9 xl:w-10 xl:h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                <Shield className="w-4 h-4 xl:w-5 xl:h-5 text-green-300" />
              </div>
              <div>
                <p className="font-medium text-sm xl:text-base">Cloud Sync</p>
                <p className="text-white/60 text-xs xl:text-sm">
                  Access your files from anywhere
                </p>
              </div>
            </div>
          </div>

          {/* Floating Code Preview - Only on XL screens */}
          <div className="absolute bottom-10 right-0 xl:right-1 hidden xl:block">
            <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl p-5 shadow-2xl border border-white/10 transform rotate-2 hover:rotate-0 transition-transform duration-500 w-56">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <pre className="text-xs font-mono">
                <code className="text-gray-300">
                  <span className="text-purple-400"># Welcome</span>
                  {"\n\n"}
                  <span className="text-gray-400">Write **bold**</span>
                  {"\n"}
                  <span className="text-gray-400">and *italic*!</span>
                  {"\n\n"}
                  <span className="text-blue-400">```js</span>
                  {"\n"}
                  <span className="text-yellow-400">log</span>
                  <span className="text-gray-300">(</span>
                  <span className="text-orange-400">&quot;Hi&quot;</span>
                  <span className="text-gray-300">)</span>
                  {"\n"}
                  <span className="text-blue-400">```</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 lg:p-6 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
        <div className="absolute inset-0 lg:hidden bg-gradient-to-br from-indigo-600/5 via-purple-600/5 to-pink-500/5" />
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
