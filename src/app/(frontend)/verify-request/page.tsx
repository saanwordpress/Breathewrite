export default function VerifyRequestPage() {
  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 items-center justify-center">
      <div className="container mx-auto px-6 max-w-md">
        <div className="bg-card border border-border p-8 rounded-3xl shadow-xl text-center space-y-4">
          <h1 className="text-3xl font-heading">Check your email</h1>
          <p className="text-foreground/70 font-light">
            We&rsquo;ve sent you a sign-in link. Open it on this device to continue. If you can&rsquo;t see it, check your spam folder.
          </p>
        </div>
      </div>
    </div>
  )
}
